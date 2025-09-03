// src/components/MapPanel.jsx
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geotiff";
import "leaflet-geotiff/leaflet-geotiff-plotty";

export default function MapPanel({ file, tileUrl }) {
  const [coords, setCoords] = useState({ lat: "0.0000", lng: "0.0000" });
  const mapRef = useRef(null);
  const tiffLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map("map", {
        center: [20, 80],
        zoom: 4,
      });

      // Add OSM base layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
  }, []);

  // Load GeoTIFF directly in browser (fallback method)
  useEffect(() => {
    if (file && !tileUrl) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const arrayBuffer = e.target.result;

        if (tiffLayerRef.current) {
          mapRef.current.removeLayer(tiffLayerRef.current);
        }

        const tiffLayer = L.leafletGeotiff(arrayBuffer, {
          renderer: new L.LeafletGeotiff.Plotty({
            displayMin: 0,
            displayMax: 255,
            colorScale: "viridis",
          }),
        });

        tiffLayer.addTo(mapRef.current);
        tiffLayerRef.current = tiffLayer;
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file, tileUrl]);

  // Load GDAL preprocessed tiles (preferred method)
  useEffect(() => {
    if (tileUrl) {
      if (tileLayerRef.current) {
        mapRef.current.removeLayer(tileLayerRef.current);
      }

      const newTileLayer = L.tileLayer(`${tileUrl}/{z}/{x}/{y}.png`, {
        attribution: "Processed with GDAL",
      });

      newTileLayer.addTo(mapRef.current);
      tileLayerRef.current = newTileLayer;
    }
  }, [tileUrl]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const lng = (px / rect.width) * 360 - 180;
    const lat = 90 - (py / rect.height) * 180;
    setCoords({ lat: lat.toFixed(4), lng: lng.toFixed(4) });
  };

  return (
    <div className="h-full w-full relative">
      <div
        id="map"
        className="h-full w-full z-0"
        onMouseMove={handleMouseMove}
      ></div>

      {/* Coordinate overlay always on top */}
      <div className="absolute bottom-4 right-4 z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-md shadow-lg flex gap-4">
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
