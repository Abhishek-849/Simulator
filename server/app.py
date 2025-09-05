from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
ALLOWED_EXTENSIONS = {'obj'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        # Create a unique filename
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        filename = f"{unique_id}_{filename}"
        
        # Save the file
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Return the file URL for the frontend to load
        file_url = f"/uploads/{filename}"
        return jsonify({
            "success": True,
            "file_url": file_url,
            "filename": filename
        })
    
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/save-mission', methods=['POST'])
def save_mission():
    try:
        # Get JSON data from request
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract mission data
        filename = data.get('filename')
        content = data.get('content')
        mission_info = data.get('missionInfo', {})
        original_terrain_file = data.get('originalTerrainFile')

        if not filename or not content:
            return jsonify({"error": "Missing filename or content"}), 400

        # Create a mission-specific folder with timestamp
        timestamp = filename.replace('mission-plan-', '').replace('.obj', '')
        mission_dir = os.path.join(os.getcwd(), "mission-files", f"mission-{timestamp}")
        os.makedirs(mission_dir, exist_ok=True)

        # Sanitize filename
        secure_name = secure_filename(filename)

        # Save the mission OBJ file (with deployed objects)
        mission_obj_path = os.path.join(mission_dir, secure_name)
        with open(mission_obj_path, 'w') as f:
            f.write(content)

        # Copy the original terrain file if it exists
        original_terrain_path = None
        original_terrain_name = None
        terrain_model_name = mission_info.get('terrainModel', '')
        
        if terrain_model_name and terrain_model_name != 'No terrain loaded':
            # Find the original file in uploads directory by matching the terrain model name
            terrain_filename = None
            for uploaded_file in os.listdir(UPLOAD_FOLDER):
                if terrain_model_name in uploaded_file and uploaded_file.endswith('.obj'):
                    terrain_filename = uploaded_file
                    break
            
            if terrain_filename:
                original_file_path = os.path.join(UPLOAD_FOLDER, terrain_filename)
                if os.path.exists(original_file_path):
                    # Copy original terrain to mission folder
                    original_terrain_name = f"original-terrain-{terrain_model_name}"
                    original_terrain_path = os.path.join(mission_dir, original_terrain_name)
                    import shutil
                    shutil.copy2(original_file_path, original_terrain_path)

        # Save mission metadata as JSON
        metadata_file = os.path.splitext(secure_name)[0] + '.json'
        metadata_path = os.path.join(mission_dir, metadata_file)
        
        # Enhanced metadata with file paths
        enhanced_metadata = {
            **mission_info,
            "files": {
                "mission_obj": secure_name,
                "original_terrain": original_terrain_name if original_terrain_path else None,
                "metadata": metadata_file
            },
            "mission_folder": mission_dir
        }
        
        with open(metadata_path, 'w') as f:
            import json
            json.dump(enhanced_metadata, f, indent=2, default=str)

        # Create a README file for the mission
        readme_path = os.path.join(mission_dir, "README.txt")
        with open(readme_path, 'w') as f:
            f.write(f"Mission Plan - {timestamp}\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"Generated: {mission_info.get('generatedAt', 'Unknown')}\n")
            f.write(f"Terrain Model: {mission_info.get('terrainModel', 'Unknown')}\n")
            f.write(f"Total Assets: {mission_info.get('totalAssets', 0)}\n\n")
            
            if mission_info.get('assetBreakdown'):
                f.write("Asset Breakdown:\n")
                for asset_type, count in mission_info.get('assetBreakdown', {}).items():
                    f.write(f"  - {asset_type.capitalize()}: {count}\n")
                f.write("\n")
            
            if mission_info.get('aoiPoints'):
                f.write(f"Area of Interest Points: {len(mission_info.get('aoiPoints', []))}\n")
            
            if mission_info.get('distancePoints'):
                f.write(f"Distance Measurement Points: {len(mission_info.get('distancePoints', []))}\n")
            
            f.write("\nFiles in this mission:\n")
            f.write(f"  - {secure_name} (Mission with deployed objects)\n")
            if original_terrain_path:
                f.write(f"  - {original_terrain_name} (Original terrain model)\n")
            f.write(f"  - {metadata_file} (Mission metadata)\n")
            f.write("  - README.txt (This file)\n")

        return jsonify({
            "success": True,
            "filename": secure_name,
            "path": mission_obj_path,
            "mission_folder": mission_dir,
            "metadata_file": metadata_file,
            "original_terrain_copied": original_terrain_path is not None,
            "message": "Mission saved successfully with all files"
        })

    except Exception as e:
        print(f"Error saving mission: {str(e)}")
        return jsonify({"error": f"Failed to save mission: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
