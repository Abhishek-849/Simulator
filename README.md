# 3D Terrain Viewer

A modern 3D terrain visualization tool built with React, Three.js, and Flask. This application allows users to upload and view 3D models with interactive controls.

## Features

- Upload and view 3D models (OBJ format)
- Interactive 3D scene with orbit controls
- Resizable side panel for layers and properties
- Clear scene functionality
- Responsive design

## Prerequisites

- Node.js (v16 or later)
- Python (3.8 or later)
- npm (comes with Node.js) or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Simulator
```

### 2. Set up the Backend (Flask)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create and activate a virtual environment (recommended):
   - Windows:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```bash
   python app.py
   ```
   The backend server will start at `http://127.0.0.1:5000`

### 3. Set up the Frontend (React)

1. Open a new terminal and navigate to the project root:
   ```bash
   cd Simulator
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Usage

1. Open the application in your browser at `http://localhost:5173`
2. Click on "File" > "Open 3D Model" to upload an OBJ file
3. Use your mouse to interact with the 3D view:
   - Left-click and drag to rotate
   - Right-click and drag to pan
   - Scroll to zoom
4. Use the "Clear Scene" button to remove the current model

## Project Structure

```
Simulator/
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components
│   ├── App.jsx             # Main application component
│   └── ...
├── server/                 # Backend Flask application
│   ├── uploads/            # Directory for uploaded files
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
├── public/                 # Static files
└── package.json            # Node.js dependencies and scripts
```

## Development

- To run the development server with hot-reload:
  ```bash
  npm run dev
  ```

- To build for production:
  ```bash
  npm run build
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
