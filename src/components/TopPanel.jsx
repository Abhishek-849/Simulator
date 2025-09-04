import { useState, useRef } from "react";
import {
  FileText,
  Eye,
  FolderOpen,
  Save,
  Trash2,
  Grid,
  Compass,
  Info,
  Box,
  Rotate3D,
  Ruler,
  MapPinned,
  Copy,
  Scissors,
  ZoomIn,
  ZoomOut,
  EyeOff,
  Layers,
  Plus,
  Users
} from "lucide-react";

export default function TopPanel({ onModelSelect, onClearScene, onDeploySoldier }) {
  const [openMenu, setOpenMenu] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".obj")) {
      alert("Please select a .obj file");
      return;
    }

    if (onModelSelect) {
      onModelSelect(file);
    }
  };

  const handleClearScene = () => {
    if (window.confirm("Are you sure you want to clear the current scene?")) {
      if (onModelSelect) {
        onModelSelect(null);
      }
      setOpenMenu(null);
    }
  };

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="bg-gray-900 text-white relative z-50 shadow-sm">
      <div className="flex items-center space-x-6 p-3">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Box size={20} className="text-blue-400" />
          <span>Simulator Prototype</span>
        </div>

        {/* Menu bar */}
        <div className="flex items-center gap-4">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("file")}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
            >
              <FileText size={16} />
              <span className="text-sm">File</span>
            </button>
            {openMenu === "file" && (
              <div className="absolute left-0 mt-1 w-48 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left"
                >
                  <FolderOpen size={16} /> Open 3D Model
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <Save size={16} /> Save Project
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Clear Scene
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("edit")}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
            >
              <Copy size={16} />
              <span className="text-sm">Edit</span>
            </button>
            {openMenu === "edit" && (
              <div className="absolute left-0 mt-1 w-44 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Copy size={14} /> Copy
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Scissors size={14} /> Cut
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("view")}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
            >
              <Eye size={16} />
              <span className="text-sm">View</span>
            </button>
            {openMenu === "view" && (
              <div className="absolute left-0 mt-1 w-48 bg-gray-800 rounded shadow-lg border border-gray-700 p-1">
                <div className="text-xs text-gray-400 px-3 py-1">Camera</div>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <Rotate3D size={16} /> Orbit Mode
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <MapPinned size={16} /> Top View
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <div className="text-xs text-gray-400 px-3 py-1">Zoom</div>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm">
                  <ZoomIn size={14} /> Zoom In
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm">
                  <ZoomOut size={14} /> Zoom Out
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <div className="text-xs text-gray-400 px-3 py-1">Grid</div>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm">
                  <EyeOff size={14} /> Toggle Grid
                </button>
              </div>
            )}
          </div>

          {/* Layer Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("layer")}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
            >
              <Layers size={16} />
              <span className="text-sm">Layer</span>
            </button>
            {openMenu === "layer" && (
              <div className="absolute left-0 mt-1 w-48 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <Plus size={16} /> Add Layer
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <Grid size={16} /> Manage Layers
                </button>
              </div>
            )}
          </div>

          {/* Tools Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("tools")}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
            >
              <Ruler size={16} />
              <span className="text-sm">Tools</span>
            </button>
            {openMenu === "tools" && (
              <div className="absolute left-0 mt-1 w-48 bg-gray-800 rounded shadow-lg border border-gray-700 p-1">
                <div className="text-xs text-gray-400 px-3 py-1">Measurements</div>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <Ruler size={16} /> Distance
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <Box size={16} /> Area
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <div className="text-xs text-gray-400 px-3 py-1">Analysis</div>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <Compass size={16} /> Contour Lines
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("help")}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
            >
              <Info size={16} />
              <span className="text-sm">Help</span>
            </button>
            {openMenu === "help" && (
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded shadow-lg border border-gray-700 p-1">
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <Info size={16} /> About
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left">
                  <Box size={16} /> Documentation
                </button>
              </div>
            )}
          </div>

          {/* Deploy Soldier Menu */}
          <button
            onClick={onDeploySoldier}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
          >
            <Users size={16} />
            <span className="text-sm">Deploy Soldier</span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right-side controls */}
        <div className="flex items-center gap-3">
          <select className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
            <option>Artillery</option>
            <option>Indirect Fire</option>
            <option>Strike</option>
          </select>

          <select className="bg-gray-800 text-white px-2 py-1 mr-24 rounded text-sm">
            <option>Mission Planning</option>
            <option>Recon</option>
            <option>Route Plan</option>
          </select>
        </div>
      </div>

      {/* Hidden file input for OBJ models */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".obj"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
