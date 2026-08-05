import React from 'react';
import { MapComponent } from '../components/MapComponent';
import { MOCK_ASSETS } from '../constants/mockData';

export const MapView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Live GPS Fleet Map</h1>
        <p className="text-slate-400 text-sm">Interactive Leaflet map displaying real-time equipment locations and status.</p>
      </div>

      <MapComponent assets={MOCK_ASSETS} />
    </div>
  );
};
