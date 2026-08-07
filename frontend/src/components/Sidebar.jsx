import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  SquaresFour,
  MapPin,
  Truck,
  Broadcast,
  Warning,
  Lightbulb,
  ChartBar,
  TrendUp,
  UserCheck,
  SignOut,
  ShieldCheck,
  QrCode
} from '@phosphor-icons/react';

export const Sidebar = () => {
  const { user, isCustomer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">FV</div>
        <div>
          <div className="sidebar-logo-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900 }}>
            FleetVision
          </div>
          <div className="sidebar-logo-sub" style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em' }}>
            {isCustomer ? 'Customer Portal' : 'Fleet Operations'}
          </div>
        </div>
      </div>

      {isCustomer ? (
        /* Customer Portal Navigation */
        <div className="sidebar-section">
          <div className="sidebar-section-label">Customer Portal</div>
          <NavLink to="/customer-portal" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UserCheck size={18} weight="bold" />
            <span>My Machinery & Portal</span>
          </NavLink>
          <NavLink to="/qr-checkinout" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <QrCode size={18} weight="bold" />
            <span>QR Check-In / Out</span>
          </NavLink>
          <NavLink to="/telemetry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Broadcast size={18} weight="bold" />
            <span>Telemetry Monitor</span>
          </NavLink>
          <NavLink to="/recommendations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Lightbulb size={18} weight="bold" />
            <span>Smart Recommendations</span>
          </NavLink>
        </div>
      ) : (
        /* Dealer Full Operations Navigation */
        <>
          <div className="sidebar-section">
            <div className="sidebar-section-label">Overview</div>
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <SquaresFour size={18} weight="bold" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <MapPin size={18} weight="bold" />
              <span>Fleet Map</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-label">Fleet Stream</div>
            <NavLink to="/assets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Truck size={18} weight="bold" />
              <span>Assets Catalog</span>
            </NavLink>
            <NavLink to="/qr-checkinout" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <QrCode size={18} weight="bold" />
              <span>QR Check-In / Out</span>
            </NavLink>
            <NavLink to="/telemetry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Broadcast size={18} weight="bold" />
              <span>Telemetry Stream</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-label">Operations & Alerts</div>
            <NavLink to="/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Warning size={18} weight="bold" />
              <span>Alerts & Anomalies</span>
            </NavLink>
            <NavLink to="/recommendations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Lightbulb size={18} weight="bold" />
              <span>Recommendations</span>
            </NavLink>
            <NavLink to="/utilization" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ChartBar size={18} weight="bold" />
              <span>Utilization Reports</span>
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <TrendUp size={18} weight="bold" />
              <span>Demand Forecasting</span>
            </NavLink>
          </div>
        </>
      )}

      {/* User Profile Footer & Logout */}
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
              {user?.fullName || (isCustomer ? 'Acme Construction' : 'CAT Fleet Manager')}
            </div>
            <div style={{ color: 'var(--amber)', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              {isCustomer ? <UserCheck size={14} weight="bold" /> : <ShieldCheck size={14} weight="bold" />}
              <span>{user?.role || (isCustomer ? 'CUSTOMER' : 'DEALER')}</span>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            title="Logout"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              padding: '6px 8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SignOut size={16} weight="bold" />
          </button>
        </div>
      </div>
    </aside>
  );
};
