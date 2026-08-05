import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './layouts/Shell';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { Telemetry } from './pages/Telemetry';
import { Alerts } from './pages/Alerts';
import { Recommendations } from './pages/Recommendations';
import { Utilization } from './pages/Utilization';
import { Analytics } from './pages/Analytics';
import { MapView } from './pages/MapView';

export const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="assets" element={<Assets />} />
        <Route path="telemetry" element={<Telemetry />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="utilization" element={<Utilization />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="map" element={<MapView />} />
        {/* Legacy redirects */}
        <Route path="maps" element={<Navigate to="/map" replace />} />
        <Route path="health" element={<Navigate to="/analytics" replace />} />
        <Route path="checkout" element={<Navigate to="/assets" replace />} />
        <Route path="checkin" element={<Navigate to="/assets" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </Router>
);

export default App;
