import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export const MapComponent = ({ assets = [] }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      const container = document.getElementById('map-container');
      if (container) {
        mapRef.current = L.map('map-container').setView([37.7749, -122.4194], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current);
      }
    }

    if (mapRef.current && assets.length > 0) {
      assets.forEach((asset) => {
        if (asset.latitude && asset.longitude) {
          L.marker([asset.latitude, asset.longitude])
            .addTo(mapRef.current)
            .bindPopup(`<b>${asset.name}</b><br/>Code: ${asset.assetCode}<br/>Status: ${asset.status}`);
        }
      });
    }
  }, [assets]);

  return (
    <div id="map-container" className="h-96 w-full rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden" />
  );
};
