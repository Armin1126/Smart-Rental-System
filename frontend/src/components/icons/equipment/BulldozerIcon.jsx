import React from 'react';

export const BulldozerIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
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
    {/* Track Base */}
    <rect x="2" y="16" width="16" height="5" rx="2.5" />
    <circle cx="5" cy="18.5" r="1" fill={color} />
    <circle cx="10" cy="18.5" r="1" fill={color} />
    <circle cx="15" cy="18.5" r="1" fill={color} />
    {/* Cab & Body */}
    <path d="M5 16V10L10 6H15V16" />
    <path d="M10 10H14V16" />
    {/* Front Blade Push Arm */}
    <path d="M15 13H20V20" />
    {/* Blade */}
    <path d="M21 11V21" strokeWidth="2.5" />
  </svg>
);
export default BulldozerIcon;
