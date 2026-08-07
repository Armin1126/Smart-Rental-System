import React from 'react';

export const BackhoeLoaderIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
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
    <circle cx="7" cy="18" r="3" />
    <circle cx="16" cy="18" r="2" />
    {/* Chassis & Cab */}
    <path d="M7 15H16" />
    <path d="M8 15V9L12 6H15V15" />
    {/* Front Loader Bucket */}
    <path d="M16 14L19 12L21 16H18" />
    {/* Rear Excavator Arm */}
    <path d="M7 15L3 10L1 14" />
  </svg>
);
export default BackhoeLoaderIcon;
