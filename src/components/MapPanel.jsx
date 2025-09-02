import { useState } from "react";

export default function MapPanel() {
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 360 - 180;
    const y = 90 - ((e.clientY - rect.top) / rect.height) * 180;
    setCoords({ lat: y.toFixed(4), lng: x.toFixed(4) });
  };

  return (
    <div
      className="h-full w-full relative bg-blue-100"
      onMouseMove={handleMouseMove}
    >
      <p className="absolute top-2 left-2 text-sm text-gray-700">
        Map Panel (Interactive Area)
      </p>

      {/* Bottom bar for coordinates */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 text-white p-2 text-sm flex justify-between">
        <span>Latitude: {coords.lat}</span>
        <span>Longitude: {coords.lng}</span>
      </div>
    </div>
  );
}
