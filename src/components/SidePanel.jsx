// src/components/SidePanel.jsx
import { useState } from 'react';
import { Eye, EyeOff, GripVertical, Settings, Trash2, Box, Ruler, Layers } from 'lucide-react';

export default function SidePanel({ layers = [], onLayersChange }) {
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
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Settings size={16} />
            <span>Properties</span>
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
            {selectedLayer ? (
              <div>
                <h3 className="text-sm font-semibold mb-4">Layer Properties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={selectedLayer.name}
                      onChange={(e) => {
                        const updatedLayers = layers.map(layer => 
                          layer.id === selectedLayer.id 
                            ? { ...layer, name: e.target.value } 
                            : layer
                        );
                        onLayersChange?.(updatedLayers);
                        setSelectedLayer({ ...selectedLayer, name: e.target.value });
                      }}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedLayer.visible}
                        onChange={(e) => {
                          const updatedLayers = layers.map(layer => 
                            layer.id === selectedLayer.id 
                              ? { ...layer, visible: e.target.checked } 
                              : layer
                          );
                          onLayersChange?.(updatedLayers);
                          setSelectedLayer({ ...selectedLayer, visible: e.target.checked });
                        }}
                        className="mr-2"
                      />
                      Visible
                    </label>
                  </div>
                  
                  {selectedLayer.type === 'model' && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                        <Box className="mr-1" size={14} />
                        3D Model
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Type: {selectedLayer.file?.type || 'N/A'}</div>
                        <div>Size: {selectedLayer.file?.size ? (selectedLayer.file.size / 1024).toFixed(2) + ' KB' : 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">
                Select a layer to view and edit its properties.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
