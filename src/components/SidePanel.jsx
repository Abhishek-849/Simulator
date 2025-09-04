// src/components/SidePanel.jsx
import { useState } from 'react';
import { Eye, EyeOff, GripVertical, Trash2, Layers, Cylinder, Box, Truck, Shield } from 'lucide-react';

export default function SidePanel({ layers = [], onLayersChange, missionDetails, setDeployMode }) {
  const [activeTab, setActiveTab] = useState('layers');
  const [selectedLayer, setSelectedLayer] = useState(null);

  const toggleLayerVisibility = (layerId) => {
    const updatedLayers = layers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    );
    onLayersChange?.(updatedLayers);
  };

  const deleteLayer = (layerId) => {
    const updatedLayers = layers.filter(layer => layer.id !== layerId);
    onLayersChange?.(updatedLayers);
    if (selectedLayer?.id === layerId) {
      setSelectedLayer(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'layers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Layers size={16} />
            <span>Layers</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('mission')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'mission' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Box size={16} />
            <span>Mission Details</span>
          </div>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'layers' ? (
          <div className="p-3">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-sm font-semibold">3D Layers</h3>
              <span className="text-xs text-gray-500">{layers.length} layer(s)</span>
            </div>

            {layers.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No layers added. Import a 3D model to get started.
              </div>
            ) : (
              <ul className="space-y-2">
                {layers.map((layer) => (
                  <li 
                    key={layer.id}
                    className={`p-2 rounded border ${selectedLayer?.id === layer.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => setSelectedLayer(layer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <GripVertical className="text-gray-400 cursor-move" size={16} />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerVisibility(layer.id);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <span className="text-sm truncate">{layer.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-4">Mission Details</h3>
            {missionDetails.troops === 0 && missionDetails.arsenal === 0 && missionDetails.vehicles === 0 && missionDetails.tanks === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No mission details set. Click "Plan Mission" in the top panel to start.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Cylinder size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">Troops: {missionDetails.troops}</span>
                  </div>
                  <button
                    onClick={() => setDeployMode({ active: true, type: 'troops' })}
                    disabled={missionDetails.troops === 0}
                    className={`py-1 px-3 rounded text-sm font-medium transition-colors ${
                      missionDetails.troops === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Deploy Troops
                  </button>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">Arsenal: {missionDetails.arsenal}</span>
                  </div>
                  <button
                    onClick={() => setDeployMode({ active: true, type: 'arsenal' })}
                    disabled={missionDetails.arsenal === 0}
                    className={`py-1 px-3 rounded text-sm font-medium transition-colors ${
                      missionDetails.arsenal === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Deploy Arsenal
                  </button>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">Vehicles: {missionDetails.vehicles}</span>
                  </div>
                  <button
                    onClick={() => setDeployMode({ active: true, type: 'vehicles' })}
                    disabled={missionDetails.vehicles === 0}
                    className={`py-1 px-3 rounded text-sm font-medium transition-colors ${
                      missionDetails.vehicles === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Deploy Vehicles
                  </button>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">Tanks: {missionDetails.tanks}</span>
                  </div>
                  <button
                    onClick={() => setDeployMode({ active: true, type: 'tanks' })}
                    disabled={missionDetails.tanks === 0}
                    className={`py-1 px-3 rounded text-sm font-medium transition-colors ${
                      missionDetails.tanks === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Deploy Tanks
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}