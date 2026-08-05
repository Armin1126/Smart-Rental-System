import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: '⬛', exact: true },
      { to: '/map', label: 'Fleet Map', icon: '🗺️' },
    ],
  },
  {
    section: 'Fleet',
    items: [
      { to: '/assets', label: 'Assets', icon: '🚜' },
      { to: '/telemetry', label: 'Telemetry', icon: '📡' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { to: '/alerts', label: 'Alerts & Anomalies', icon: '🔔', badgeKey: 'alerts' },
      { to: '/recommendations', label: 'Recommendations', icon: '💡', badgeKey: 'recs' },
      { to: '/utilization', label: 'Utilization', icon: '📊' },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { to: '/analytics', label: 'AI Pipeline', icon: '⚡' },
    ],
  },
];

export const Sidebar = ({ badges = {} }) => {
  const location = useLocation();

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark" />
        <div>
          <div className="sidebar-logo-text">Smart Rental</div>
          <div className="sidebar-logo-sub">Fleet Operations</div>
        </div>
      </div>

      {/* Nav Sections */}
      {NAV.map(section => (
        <div key={section.section} className="sidebar-section">
          <div className="sidebar-section-label">{section.section}</div>
          {section.items.map(item => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== '/';
            const badge = item.badgeKey && badges[item.badgeKey];

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {badge > 0 && <span className="nav-badge">{badge > 99 ? '99+' : badge}</span>}
              </NavLink>
            );
          })}
        </div>
      ))}

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">Smart Rental System v1.0</div>
        <div className="sidebar-footer-text" style={{ marginTop: 2 }}>
          <span style={{ color: 'var(--emerald)' }}>●</span> All services online
        </div>
      </div>
    </nav>
  );
};
