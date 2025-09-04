import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, GripVertical, Trash2, Layers, Cylinder, Box, Truck, Shield } from 'lucide-react';

// Elevation Graph Component
function ElevationGraph({ elevationData }) {
  if (!elevationData.points || elevationData.points.length === 0) {
    return null;
  }

  const points = elevationData.points;
  const maxElev = Math.max(...points.map(p => p.elevation));
  const minElev = Math.min(...points.map(p => p.elevation));
  const range = maxElev - minElev || 1; // Avoid division by zero

  // Create SVG path for elevation profile
  const pathData = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 280; // Scale to fit within 300px width, leave margins
    const y = 80 - ((point.elevation - minElev) / range) * 60; // Scale to 60px height within 80px area
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');

  // Also create individual data points for better visibility
  const dotPoints = points.filter((_, index) => index % 5 === 0); // Show every 5th point as a dot

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Elevation Profile</h3>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('clearElevationProfile'))}
          className="text-xs text-red-500 hover:text-red-700 underline"
        >
          Clear
        </button>
      </div>

      <div className="text-xs text-gray-600 mb-2">
        Distance: {elevationData.distance?.toFixed(2)}m |
        Elev: {minElev.toFixed(2)}m - {maxElev.toFixed(2)}m |
        Range: {range.toFixed(2)}m
      </div>

      <svg width="320" height="120" className="border border-gray-200 rounded bg-white">
        {/* Grid lines */}
        <defs>
          <pattern id={`grid-${Math.random()}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="280" height="80" fill="url(#grid)" x="20" y="20"/>

        {/* Elevation profile line */}
        <path
          d={`M 20 100 L 20 20 L ${pathData} L 300 100 Z`}
          stroke="#2563eb"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Individual data points for reference */}
        {dotPoints.map((point, index) => {
          const x = (point.distance / elevationData.distance) * 280 + 20;
          const y = 100 - ((point.elevation - minElev) / range) * 60;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="#ef4444"
              stroke="#dc2626"
              strokeWidth="1"
            />
          );
        })}

        {/* X and Y axis labels */}
        <g>
          <text x="160" y="112" textAnchor="middle" className="text-xs fill-gray-600" style={{ fontSize: '10px' }}>
            Distance Along Line (meters)
          </text>
          <text x="12" y="65" textAnchor="middle" transform="rotate(-90)" className="text-xs fill-gray-600" style={{ fontSize: '10px' }}>
            Elevation (meters)
          </text>
        </g>

        {/* Elevation scale markers */}
        <g>
          <text x="305" y="25" textAnchor="start" className="text-xs fill-red-600" style={{ fontSize: '9px' }}>
            {maxElev.toFixed(2)}m
          </text>
          <text x="305" y="95" textAnchor="start" className="text-xs fill-blue-600" style={{ fontSize: '9px' }}>
            {minElev.toFixed(2)}m
          </text>
        </g>

        {/* Scale lines */}
        <line x1="285" y1="20" x2="285" y2="100" stroke="#6b7280" strokeWidth="1" strokeDasharray="2"/>
      </svg>

      {/* Sample points info */}
      <div className="mt-2 text-xs text-gray-600">
        Samples: {points.length} | Click "Clear" to remove profile
      </div>
    </div>
  );
}

export default function SidePanel({ layers = [], onLayersChange, missionDetails, setDeployMode }) {
  const [activeTab, setActiveTab] = useState('layers');
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [elevationData, setElevationData] = useState({ points: [], distance: 0 });

  // Listen for elevation profile updates
  useEffect(() => {
    const handleElevationUpdate = (event) => {
      setElevationData(event.detail);
      setActiveTab('analysis'); // Switch to analysis tab when data arrives
    };

    const handleClearElevation = () => {
      setElevationData({ points: [], distance: 0 });
    };

    window.addEventListener('elevationProfileUpdate', handleElevationUpdate);
    window.addEventListener('clearElevationProfile', handleClearElevation);

    return () => {
      window.removeEventListener('elevationProfileUpdate', handleElevationUpdate);
      window.removeEventListener('clearElevationProfile', handleClearElevation);
    };
  }, []);

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
      {/* Enhanced Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeTab === 'layers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Layers size={16} />
            <span>Layers</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('mission')}
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeTab === 'mission' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Box size={16} />
            <span>Mission</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeTab === 'analysis' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Eye size={16} />
            <span>Analysis</span>
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
                    className={`p-2 rounded border ${
                      selectedLayer?.id === layer.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
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
        ) : activeTab === 'analysis' ? (
          <div className="p-3">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-sm font-semibold">Terrain Analysis</h3>
              <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Distance Tool Active
              </span>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">How to use:</p>
                <ol className="space-y-1 text-xs text-gray-600 ml-4">
                  <li>1. Click "Distance" in Tools menu</li>
                  <li>2. Click first point on terrain</li>
                  <li>3. Click second point to draw line</li>
                  <li>4. View elevation profile below</li>
                </ol>
              </div>

              <ElevationGraph elevationData={elevationData} />
            </div>
          </div>
        ) : (
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-4">Mission Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Cylinder size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">Troops: {missionDetails.troops}</span>
                </div>
                <button
                  onClick={() => setDeployMode({ active: true, type: 'troops' })}
                  disabled={missionDetails.troops === 0}
                  className={`w-28 py-1 px-3 rounded text-sm font-medium text-center transition-colors ${
                    missionDetails.troops === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Deploy Troops
                </button>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Box size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">Arsenal: {missionDetails.arsenal}</span>
                </div>
                <button
                  onClick={() => setDeployMode({ active: true, type: 'arsenal' })}
                  disabled={missionDetails.arsenal === 0}
                  className={`w-28 py-1 px-3 rounded text-sm font-medium text-center transition-colors ${
                    missionDetails.arsenal === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Deploy Arsenal
                </button>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Truck size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">Vehicles: {missionDetails.vehicles}</span>
                </div>
                <button
                  onClick={() => setDeployMode({ active: true, type: 'vehicles' })}
                  disabled={missionDetails.vehicles === 0}
                  className={`w-28 py-1 px-3 rounded text-sm font-medium text-center transition-colors ${
                    missionDetails.vehicles === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Deploy Vehicles
                </button>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Shield size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">Tanks: {missionDetails.tanks}</span>
                </div>
                <button
                  onClick={() => setDeployMode({ active: true, type: 'tanks' })}
                  disabled={missionDetails.tanks === 0}
                  className={`w-28 py-1 px-3 rounded text-sm font-medium text-center transition-colors ${
                    missionDetails.tanks === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Deploy Tanks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
