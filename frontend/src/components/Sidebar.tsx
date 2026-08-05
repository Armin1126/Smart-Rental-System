import React from 'react';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import InsightsIcon from '@mui/icons-material/Insights';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Asset Catalog', path: '/assets', icon: <PrecisionManufacturingIcon /> },
    { label: 'Rental Contracts', path: '/rentals', icon: <ReceiptLongIcon /> },
    { label: 'Analytics & IoT', path: '/analytics', icon: <InsightsIcon /> },
  ];

  return (
    <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 min-h-[calc(100vh-64px)] p-4 flex flex-col justify-between">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-l-4 border-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/40 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">Environment Ready</p>
        <p className="mt-1">Vite + React + MUI + Tailwind</p>
      </div>
    </aside>
  );
};
