// src/components/TopPanel.jsx
import { FileText, Edit2, Eye, Layers, Target, MapPin } from "lucide-react";

export default function TopPanel() {
  return (
    <div className="bg-gray-900 text-white p-3 flex items-center space-x-6 shadow-sm">
      <div className="text-lg font-semibold">Simulator Prototype</div>

      {/* Primary menu items (icons + text) */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800">
          <FileText size={16} />
          <span className="text-sm">Project</span>
        </button>

        <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800">
          <Edit2 size={16} />
          <span className="text-sm">Edit</span>
        </button>

        <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800">
          <Eye size={16} />
          <span className="text-sm">View</span>
        </button>

        <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800">
          <Layers size={16} />
          <span className="text-sm">Layer</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* domain-specific dropdowns */}
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

        {/* small icon buttons on right */}
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
  );
}
