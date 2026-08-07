import React from 'react';

export const SkidSteerIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
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
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="13" cy="18" r="2.5" />
    {/* Compact Body & ROPS Cab */}
    <path d="M4 15.5V10L8 5H14V15.5" />
    <path d="M8 10H13V15.5" />
    {/* Front Loader Bucket */}
    <path d="M13 12L17 10L20 14H16" />
  </svg>
);
export default SkidSteerIcon;
