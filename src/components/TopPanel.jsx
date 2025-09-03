// src/components/TopPanel.jsx
import { useState } from "react";
import {
  FileText,
  Edit2,
  Eye,
  Layers,
  Target,
  MapPin,
  FolderOpen,
  Save,
  Plus,
  Copy,
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  Grid,
  EyeOff,
  Database,
  Compass,
  Info,
  PlugZap,
} from "lucide-react";

export default function TopPanel({ onFileSelect }) {
  const [openMenu, setOpenMenu] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="bg-gray-900 text-white relative z-50 shadow-sm">
      <div className="flex items-center space-x-6 p-3">
        <div className="text-lg font-semibold">Simulator Prototype</div>

        {/* Menu bar */}
        <div className="flex items-center gap-4">
          {/* Project */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("Project")}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
            >
              <FileText size={16} /> <span className="text-sm">Project</span>
            </button>
            {openMenu === "Project" && (
              <div className="absolute left-0 mt-1 w-44 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Plus size={14} /> New
                </button>
                <button
                  onClick={() => document.getElementById("tiffInput").click()}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm"
                >
                  <FolderOpen size={14} /> Open
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Save size={14} /> Save
                </button>
              </div>
            )}
          </div>

          {/* Edit */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("Edit")}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
            >
              <Edit2 size={16} /> <span className="text-sm">Edit</span>
            </button>
            {openMenu === "Edit" && (
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

          {/* View */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("View")}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
            >
              <Eye size={16} /> <span className="text-sm">View</span>
            </button>
            {openMenu === "View" && (
              <div className="absolute left-0 mt-1 w-44 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <ZoomIn size={14} /> Zoom In
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <ZoomOut size={14} /> Zoom Out
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <EyeOff size={14} /> Hide Grid
                </button>
              </div>
            )}
          </div>

          {/* Layer */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("Layer")}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
            >
              <Layers size={16} /> <span className="text-sm">Layer</span>
            </button>
            {openMenu === "Layer" && (
              <div className="absolute left-0 mt-1 w-44 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Plus size={14} /> Add Layer
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Grid size={14} /> Manage Layers
                </button>
              </div>
            )}
          </div>

          {/* Arsenal */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("Arsenal")}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
            >
              <Target size={16} /> <span className="text-sm">Arsenal</span>
            </button>
            {openMenu === "Arsenal" && (
              <div className="absolute left-0 mt-1 w-44 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Target size={14} /> Weapons List
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Plus size={14} /> Add Weapon
                </button>
              </div>
            )}
          </div>

          {/* Unit */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("Unit")}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
            >
              <MapPin size={16} /> <span className="text-sm">Unit</span>
            </button>
            {openMenu === "Unit" && (
              <div className="absolute left-0 mt-1 w-44 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <MapPin size={14} /> Add Unit
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Compass size={14} /> Manage Units
                </button>
              </div>
            )}
          </div>

          {/* Impact Arc */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("Impact Arc")}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
            >
              <Target size={16} /> <span className="text-sm">Impact Arc</span>
            </button>
            {openMenu === "Impact Arc" && (
              <div className="absolute left-0 mt-1 w-44 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Target size={14} /> Draw Arc
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Database size={14} /> Arc Settings
                </button>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("Metadata")}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
            >
              <Info size={16} /> <span className="text-sm">Metadata</span>
            </button>
            {openMenu === "Metadata" && (
              <div className="absolute left-0 mt-1 w-44 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Info size={14} /> View Metadata
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Edit2 size={14} /> Edit Metadata
                </button>
              </div>
            )}
          </div>

          {/* Plugins */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("Plugins")}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
            >
              <PlugZap size={16} /> <span className="text-sm">Plugins</span>
            </button>
            {openMenu === "Plugins" && (
              <div className="absolute left-0 mt-1 w-44 bg-gray-800 rounded shadow-lg border border-gray-700">
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <PlugZap size={14} /> Manage Plugins
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 text-sm">
                  <Plus size={14} /> Install Plugin
                </button>
              </div>
            )}
          </div>
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

          <select className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
            <option>Mission Planning</option>
            <option>Recon</option>
            <option>Route Plan</option>
          </select>

          <div className="flex items-center gap-2">
            <button title="Center" className="p-1 rounded hover:bg-gray-800">
              <MapPin size={18} />
            </button>
            <button title="Crosshair" className="p-1 rounded hover:bg-gray-800">
              <Target size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for TIFF */}
      <input
        type="file"
        id="tiffInput"
        accept=".tif,.tiff"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
