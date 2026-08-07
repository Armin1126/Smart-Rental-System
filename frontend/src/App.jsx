import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Shell } from './layouts/Shell';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { Telemetry } from './pages/Telemetry';
import { Alerts } from './pages/Alerts';
import { Recommendations } from './pages/Recommendations';
import { Utilization } from './pages/Utilization';
import { Analytics } from './pages/Analytics';
import { MapView } from './pages/MapView';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import { QrCheckInOut } from './pages/QrCheckInOut';

const ProtectedLayout = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Shell />;
};

const DealerOnlyRoute = ({ children }) => {
  const { isCustomer } = useAuth();
  if (isCustomer) {
    return <Navigate to="/customer-portal" replace />;
  }
  return children;
};

export const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<DealerOnlyRoute><Dashboard /></DealerOnlyRoute>} />
          <Route path="customer-portal" element={<CustomerDashboard />} />
          <Route path="assets" element={<DealerOnlyRoute><Assets /></DealerOnlyRoute>} />
          <Route path="qr-checkinout" element={<QrCheckInOut />} />
          <Route path="telemetry" element={<Telemetry />} />
          <Route path="alerts" element={<DealerOnlyRoute><Alerts /></DealerOnlyRoute>} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="utilization" element={<DealerOnlyRoute><Utilization /></DealerOnlyRoute>} />
          <Route path="analytics" element={<DealerOnlyRoute><Analytics /></DealerOnlyRoute>} />
          <Route path="map" element={<DealerOnlyRoute><MapView /></DealerOnlyRoute>} />
          
          {/* Fallbacks & Redirects */}
          <Route path="maps" element={<Navigate to="/map" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
