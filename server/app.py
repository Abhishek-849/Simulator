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

        if not filename or not content:
            return jsonify({"error": "Missing filename or content"}), 400

        # Create a mission-specific folder in the root directory
        mission_dir = os.path.join(os.getcwd(), "mission-files")
        os.makedirs(mission_dir, exist_ok=True)

        # Sanitize filename
        secure_name = secure_filename(filename)

        # Save the OBJ file
        filepath = os.path.join(mission_dir, secure_name)
        with open(filepath, 'w') as f:
            f.write(content)

        # Also save mission metadata as JSON
        metadata_file = os.path.splitext(secure_name)[0] + '.json'
        metadata_path = os.path.join(mission_dir, metadata_file)
        with open(metadata_path, 'w') as f:
            import json
            json.dump(mission_info, f, indent=2, default=str)

        return jsonify({
            "success": True,
            "filename": secure_name,
            "path": filepath,
            "metadata_file": metadata_file,
            "message": "Mission saved successfully"
        })

    except Exception as e:
        print(f"Error saving mission: {str(e)}")
        return jsonify({"error": f"Failed to save mission: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
