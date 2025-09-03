from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import os
import tempfile
import uuid

app = Flask(__name__)
CORS(app)

# Directory where tiles will be stored
TILES_DIR = os.path.join(os.getcwd(), "tiles")
os.makedirs(TILES_DIR, exist_ok=True)

@app.route("/process", methods=["POST"])
def process():
    file = request.files["file"]
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    # Unique folder for each upload
    session_id = str(uuid.uuid4())
    output_dir = os.path.join(TILES_DIR, session_id)
    os.makedirs(output_dir, exist_ok=True)

    # Save uploaded file temporarily
    input_path = os.path.join(output_dir, file.filename)
    file.save(input_path)

    try:
        # Run gdal2tiles (generate XYZ tiles)
        cmd = [
            "gdal2tiles",
            "-p", "mercator",
            "-z", "0-6",     # zoom levels (adjust as needed)
            input_path,
            output_dir
        ]
        subprocess.check_output(cmd, stderr=subprocess.STDOUT, text=True)

        # Return the tile layer URL to frontend
        tile_url = f"http://127.0.0.1:5000/tiles/{session_id}/{{z}}/{{x}}/{{y}}.png"
        return jsonify({"success": True, "tile_url": tile_url})

    except subprocess.CalledProcessError as e:
        return jsonify({"success": False, "error": e.output}), 500

@app.route("/tiles/<session_id>/<z>/<x>/<y>.png")
def serve_tiles(session_id, z, x, y):
    path = os.path.join(TILES_DIR, session_id, z, x, f"{y}.png")
    directory = os.path.dirname(path)
    filename = os.path.basename(path)
    return send_from_directory(directory, filename)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
