import React from 'react';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import OutputIcon from '@mui/icons-material/Output';
import InputIcon from '@mui/icons-material/Input';
import SensorsIcon from '@mui/icons-material/Sensors';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MapIcon from '@mui/icons-material/Map';
import InsightsIcon from '@mui/icons-material/Insights';

export const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Assets', path: '/assets', icon: <PrecisionManufacturingIcon /> },
    { label: 'Check-Out', path: '/checkout', icon: <OutputIcon /> },
    { label: 'Check-In', path: '/checkin', icon: <InputIcon /> },
    { label: 'Telemetry', path: '/telemetry', icon: <SensorsIcon /> },
    { label: 'Alerts', path: '/alerts', icon: <NotificationsActiveIcon /> },
    { label: 'Recommendations', path: '/recommendations', icon: <AutoAwesomeIcon /> },
    { label: 'MapView', path: '/maps', icon: <MapIcon /> },
    { label: 'Analytics', path: '/analytics', icon: <InsightsIcon /> },
  ];

  return (
    <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 min-h-[calc(100vh-64px)] p-4 flex flex-col justify-between">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border-l-4 border-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/40 text-xs text-slate-400">
        <p className="font-semibold text-amber-400">Caterpillar Ops Platform</p>
        <p className="mt-0.5 text-[11px]">React + Vite + JS + MUI + Leaflet</p>
      </div>
    </aside>
  );
};
