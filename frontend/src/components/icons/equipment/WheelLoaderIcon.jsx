import React from 'react';

export const WheelLoaderIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
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
    <circle cx="6" cy="18" r="3" />
    <circle cx="16" cy="18" r="3" />
    {/* Chassis & Cab */}
    <path d="M6 15H16" />
    <path d="M7 15V10L11 7H15V15" />
    {/* Lift Arms & Front Bucket */}
    <path d="M14 13L19 9L22 13H18" />
  </svg>
);
export default WheelLoaderIcon;
