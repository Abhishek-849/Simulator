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

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
