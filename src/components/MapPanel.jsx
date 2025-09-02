// src/components/MapPanel.jsx
import { useState } from "react";

export default function MapPanel() {
  const [coords, setCoords] = useState({ lat: "0.0000", lng: "0.0000" });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    // simple mapping to lat/lng (placeholder logic for prototype)
    const lng = (px / rect.width) * 360 - 180;
    const lat = 90 - (py / rect.height) * 180;
    setCoords({ lat: lat.toFixed(4), lng: lng.toFixed(4) });
  };

  return (
    <div
      className="h-full w-full relative bg-blue-50"
      onMouseMove={handleMouseMove}
    >
      {/* Map placeholder content (keeps previous look) */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
        [ Map Canvas Placeholder ]
      </div>

      {/* bottom-right coordinate box (adjacent lat / lng) */}
      <div className="absolute bottom-4 right-4 bg-gray-900 text-white text-sm px-3 py-2 rounded-md shadow-lg flex gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-gray-300">Lat:</span>
          <span className="font-medium">{coords.lat}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-gray-300">Lng:</span>
          <span className="font-medium">{coords.lng}</span>
        </div>
      </div>
    </div>
  );
}
