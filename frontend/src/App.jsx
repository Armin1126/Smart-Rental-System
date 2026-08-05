import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { CheckOut } from './pages/CheckOut';
import { CheckIn } from './pages/CheckIn';
import { Telemetry } from './pages/Telemetry';
import { Alerts } from './pages/Alerts';
import { Recommendations } from './pages/Recommendations';
import { MapView } from './pages/MapView';
import { Analytics } from './pages/Analytics';
import { AppProvider } from './context/AppContext';

export const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<Assets />} />
            <Route path="checkout" element={<CheckOut />} />
            <Route path="checkin" element={<CheckIn />} />
            <Route path="telemetry" element={<Telemetry />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="maps" element={<MapView />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
