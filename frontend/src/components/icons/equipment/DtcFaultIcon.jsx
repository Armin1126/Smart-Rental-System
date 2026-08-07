import React from 'react';

export const DtcFaultIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
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
    {/* Alert Triangle */}
    <path d="M12 3L2 20H22L12 3Z" />
    {/* Wrench Motif Inside */}
    <line x1="12" y1="9" x2="12" y2="13" />
    <circle cx="12" cy="16.5" r="0.75" fill={color} />
  </svg>
);
export default DtcFaultIcon;
