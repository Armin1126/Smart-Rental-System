import React from 'react';

export const CraneIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
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
    {/* Wheels / Carrier Base */}
    <circle cx="5" cy="19" r="2" />
    <circle cx="12" cy="19" r="2" />
    <circle cx="18" cy="19" r="2" />
    <path d="M3 17H20V14H3V17Z" />
    {/* Cab & Crane Lattice Boom */}
    <path d="M7 14V9H11V14" />
    <path d="M11 12L20 2" strokeWidth="2.5" />
    {/* Hoist Cable & Hook */}
    <path d="M20 2V10L19 12" />
  </svg>
);
export default CraneIcon;
