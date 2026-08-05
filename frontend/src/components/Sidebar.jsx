import React from 'react';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLateOutlined';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import SettingsApplicationsOutlinedIcon from '@mui/icons-material/SettingsApplicationsOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const Sidebar = () => {
  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon fontSize="small" /> },
    { label: 'Needs Review', path: '/alerts', icon: <AssignmentLateIcon fontSize="small" />, badge: 3 },
    { label: 'Assets', path: '/assets', icon: <PrecisionManufacturingIcon fontSize="small" /> },
    { label: 'Map', path: '/maps', icon: <MapOutlinedIcon fontSize="small" /> },
    { label: 'Tasks', path: '/recommendations', icon: <TaskAltOutlinedIcon fontSize="small" /> },
    { label: 'Maintenance', path: '/telemetry', icon: <BuildOutlinedIcon fontSize="small" />, hasSub: true },
    { label: 'Health', path: '/analytics', icon: <FavoriteBorderOutlinedIcon fontSize="small" /> },
    { label: 'Utilization', path: '/checkout', icon: <ShowChartOutlinedIcon fontSize="small" /> },
    { label: 'Manage', path: '/checkin', icon: <SettingsApplicationsOutlinedIcon fontSize="small" />, hasSub: true },
  ];

  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] flex flex-col justify-between select-none">
      <nav className="py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-all duration-150 border-l-4 ${
                isActive
                  ? 'bg-gray-100 text-gray-900 border-gray-900 font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-600">{item.icon}</span>
              <span>{item.label}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {item.badge && (
                <span className="w-4 h-4 bg-[#ffcd00] text-gray-900 rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                  {item.badge}
                </span>
              )}
              {item.hasSub && (
                <KeyboardArrowDownIcon className="text-gray-400" fontSize="small" />
              )}
            </div>
          </NavLink>
        ))}
      </nav>

      {/* VisionLink Footer */}
      <div className="p-4 border-t border-gray-100 text-[11px] text-gray-400 space-y-1">
        <p className="hover:text-gray-600 cursor-pointer">Privacy - Cookies - Legal</p>
        <p>Caterpillar © 2025. All Rights Reserved.</p>
      </div>
    </aside>
  );
};
