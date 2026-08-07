import React from 'react';

export const EngineHoursIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Clock Outer Ring */}
    <circle cx="12" cy="12" r="9" />
    {/* Clock Hands */}
    <polyline points="12 7 12 12 15 14" />
    {/* Piston / Cylinder Motif Notch Top & Bottom */}
    <path d="M10 2H14" />
    <path d="M10 22H14" />
  </svg>
);
export default EngineHoursIcon;
