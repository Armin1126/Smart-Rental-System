import React from 'react';

export const ExcavatorIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
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
    <rect x="2" y="17" width="14" height="4" rx="2" />
    <circle cx="5" cy="19" r="0.8" fill={color} />
    <circle cx="9" cy="19" r="0.8" fill={color} />
    <circle cx="13" cy="19" r="0.8" fill={color} />
    {/* House / Cab */}
    <path d="M4 17V12L8 9H13V17" />
    <path d="M8 12H12V17" />
    {/* Boom & Stick */}
    <path d="M12 12L17 5L20 10L22 9" />
    {/* Bucket */}
    <path d="M22 9L20 13L17 12" />
  </svg>
);
export default ExcavatorIcon;
