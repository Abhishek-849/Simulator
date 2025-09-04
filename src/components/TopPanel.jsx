// src/components/TopPanel.jsx
import { useState, useRef } from "react";
import {
  FileText,
  Eye,
  FolderOpen,
  Save,
  Grid,
  Compass,
  Info,
  Box,
  Rotate3D,
  Ruler,
  MapPinned,
  ZoomIn,
  ZoomOut,
  EyeOff,
  Layers,
  Plus,
  Map,
} from "lucide-react";

export default function TopPanel({ onModelSelect, onClearScene, setMissionDetails, resetMissionDetails, items = [], layers = [], missionDetails = {} }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    troops: "",
    arsenal: "",
    vehicles: "",
    tanks: "",
  });
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

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setFormData({ troops: "", arsenal: "", vehicles: "", tanks: "" });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetMissionDetails();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) { // Allow only non-negative integers
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleModalSubmit = () => {
    const details = {
      troops: parseInt(formData.troops) || 0,
      arsenal: parseInt(formData.arsenal) || 0,
      vehicles: parseInt(formData.vehicles) || 0,
      tanks: parseInt(formData.tanks) || 0,
    };
    setMissionDetails(details);
    setIsModalOpen(false);
  };

  const saveMission = async () => {
    if (items.length === 0) {
      alert('No deployed items to save. Please deploy troops, arsenal, vehicles, or tanks first.');
      return;
    }

    try {
      // Generate OBJ content including deployed items
      let objContent = '# Mission Plan OBJ File\n';
      let vertexCount = 0;

      // Get current timestamp for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `mission-plan-${timestamp}.obj`;

      // Build OBJ content from items
      items.forEach((item, index) => {
        const [x, y, z] = item.position;
        const scale = item.type === 'troops' ? 0.03 : item.type === 'arsenal' ? 0.04 : item.type === 'vehicles' ? 0.08 : 0.12;

        // Create different geometries based on item type
        let geometryData;
        switch (item.type) {
          case 'troops':
            // Simple cylinder for troops
            geometryData = {
              vertices: [
                [0, scale, 0],      // v1
                [scale, 0, 0],      // v2
                [-scale, 0, 0],     // v3
                [0, -scale, 0],     // v4
              ],
              faces: [[1, 2, 3], [1, 3, 4], [1, 4, 2], [2, 4, 3]]
            };
            break;
          case 'arsenal':
            // Box for arsenal
            geometryData = {
              vertices: [
                [-scale, -scale, -scale], // v1
                [scale, -scale, -scale],  // v2
                [scale, scale, -scale],   // v3
                [-scale, scale, -scale],  // v4
                [-scale, -scale, scale],  // v5
                [scale, -scale, scale],   // v6
                [scale, scale, scale],    // v7
                [-scale, scale, scale],   // v8
              ],
              faces: [
                [1, 2, 3, 4], [5, 8, 7, 6], // bottom/top
                [1, 4, 8, 5], [2, 6, 7, 3], // sides
                [1, 5, 6, 2], [4, 3, 7, 8]  // front/back
              ]
            };
            break;
          case 'vehicles':
            // Longer box for vehicles
            geometryData = {
              vertices: [
                [-scale*1.5, -scale, -scale/2], // v1
                [scale*1.5, -scale, -scale/2],  // v2
                [scale*1.5, scale, -scale/2],   // v3
                [-scale*1.5, scale, -scale/2],  // v4
                [-scale*1.5, -scale, scale/2],  // v5
                [scale*1.5, -scale, scale/2],   // v6
                [scale*1.5, scale, scale/2],    // v7
                [-scale*1.5, scale, scale/2],   // v8
              ],
              faces: [
                [1, 2, 3, 4], [5, 8, 7, 6], // bottom/top
                [1, 4, 8, 5], [2, 6, 7, 3], // sides
                [1, 5, 6, 2], [4, 3, 7, 8]  // front/back
              ]
            };
            break;
          case 'tanks':
            // Large box for tanks
            geometryData = {
              vertices: [
                [-scale, -scale, -scale*1.2], // v1
                [scale, -scale, -scale*1.2],  // v2
                [scale, scale, -scale*1.2],   // v3
                [-scale, scale, -scale*1.2],  // v4
                [-scale, -scale, scale],      // v5
                [scale, -scale, scale],       // v6
                [scale, scale, scale],        // v7
                [-scale, scale, scale],       // v8
              ],
              faces: [
                [1, 2, 3, 4], [5, 8, 7, 6], // bottom/top
                [1, 4, 8, 5], [2, 6, 7, 3], // sides
                [1, 5, 6, 2], [4, 3, 7, 8]  // front/back
              ]
            };
            break;
          default:
            return; // Skip unknown types
        }

        // Add vertices with position translation
        geometryData.vertices.forEach(([vx, vy, vz]) => {
          objContent += `v ${x + vx} ${y + vy - 0.05} ${z + vz}\n`; // Subtract small offset for ground placement
          vertexCount++;
        });

        // Add faces (OBJ face indices are 1-based)
        const baseIndex = vertexCount - geometryData.vertices.length;
        geometryData.faces.forEach(face => {
          const faceStr = face.map(idx => idx + baseIndex).join(' ');
          objContent += `f ${faceStr}\n`;
        });

        // Add material group
        objContent += `g ${item.type}-${index + 1}\n`;
        objContent += `\n`;
      });

      // Create mission summary comment
      const totalItems = items.length;
      const assetSummary = Object.entries(
        items.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {})
      ).map(([type, count]) => `${count} ${type}`).join(', ');

      objContent = `# Mission Plan - Assets: ${assetSummary} (Total: ${totalItems})\n` +
                   `# Generated: ${new Date().toISOString()}\n` +
                   `# Mission Details: Troops: ${missionDetails.troops}, Arsenal: ${missionDetails.arsenal}, Vehicles: ${missionDetails.vehicles}, Tanks: ${missionDetails.tanks}\n\n` +
                   objContent;

      // Send OBJ content to backend for saving
      const response = await fetch('http://localhost:5000/save-mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          content: objContent,
          missionInfo: {
            totalAssets: totalItems,
            assetBreakdown: items.reduce((acc, item) => {
              acc[item.type] = (acc[item.type] || 0) + 1;
              return acc;
            }, {}),
            missionDetails,
            generatedAt: new Date().toISOString(),
            terrainModel: layers.find(l => l.type === 'model')?.name || 'No terrain loaded'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Mission saved successfully!\n\n📁 File: ${result.filename}\n📍 Location: ${result.path}\n📊 Assets: ${totalItems}`);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error saving mission:', error);
      alert(`❌ Error saving mission: ${error.message}`);
    }

    setOpenMenu(null);
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
                <button
                  onClick={saveMission}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left"
                >
                  <Save size={16} /> Save Mission
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <button
                  onClick={handleClearScene}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left"
                >
                  Clear Scene
                </button>
              </div>
            )}
          </div>

          {/* Plan Mission Button */}
          <div className="relative">
            <button
              onClick={handleModalOpen}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
            >
              <Map size={16} />
              <span className="text-sm">Plan Mission</span>
            </button>
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
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('startDistanceTool'));
                    setOpenMenu(null);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-sm text-left"
                >
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

      {/* Mission Planning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Mission Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Troops</label>
                <input
                  type="text"
                  name="troops"
                  value={formData.troops}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black placeholder-gray-400"
                  placeholder="Enter number of troops"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Arsenal</label>
                <input
                  type="text"
                  name="arsenal"
                  value={formData.arsenal}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black placeholder-gray-400"
                  placeholder="Enter number of arsenal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicles</label>
                <input
                  type="text"
                  name="vehicles"
                  value={formData.vehicles}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black placeholder-gray-400"
                  placeholder="Enter number of vehicles"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanks</label>
                <input
                  type="text"
                  name="tanks"
                  value={formData.tanks}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black placeholder-gray-400"
                  placeholder="Enter number of tanks"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
