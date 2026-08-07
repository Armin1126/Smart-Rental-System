import React from 'react';

export const GraderIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
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
    {/* Wheels */}
    <circle cx="4" cy="18" r="2.5" />
    <circle cx="9" cy="18" r="2.5" />
    <circle cx="20" cy="18" r="2.5" />
    {/* Long Frame */}
    <path d="M4 15.5H20" />
    <path d="M6 15.5V11L10 8H14V15.5" />
    {/* Moldboard Blade */}
    <path d="M12 15.5L14 20" strokeWidth="2.5" />
  </svg>
);
export default GraderIcon;
