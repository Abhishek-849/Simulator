// src/components/TopPanel.jsx
import { useState } from "react";
import { FileText, Edit2, Eye, Layers, Target, MapPin, FolderOpen } from "lucide-react";

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
          {["Project", "Edit", "View", "Layer", "Arsenal", "Unit", "Impact Arc", "Metadata", "Plugins"].map(
            (menu) => (
              <div key={menu} className="relative">
                <button
                  onClick={() => toggleMenu(menu)}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800"
                >
                  {menu === "Project" && <FileText size={16} />}
                  {menu === "Edit" && <Edit2 size={16} />}
                  {menu === "View" && <Eye size={16} />}
                  {menu === "Layer" && <Layers size={16} />}
                  <span className="text-sm">{menu}</span>
                </button>

                {/* Dropdown for Project */}
                {openMenu === menu && menu === "Project" && (
                  <div className="absolute left-0 mt-1 w-40 bg-gray-800 rounded shadow-lg border border-gray-700">
                    <button className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                      New
                    </button>
                    <button
                      onClick={() => document.getElementById("tiffInput").click()}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen size={14} /> Open
                      </div>
                    </button>
                    <button className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                      Save
                    </button>
                  </div>
                )}
              </div>
            )
          )}
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
