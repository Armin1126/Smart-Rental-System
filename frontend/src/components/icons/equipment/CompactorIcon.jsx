import React from 'react';

export const CompactorIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
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
    {/* Rear Wheel & Front Heavy Drum */}
    <circle cx="6" cy="17" r="3" />
    <circle cx="17" cy="16" r="4" strokeWidth="2.5" />
    {/* Chassis & Cab */}
    <path d="M6 14H17" />
    <path d="M7 14V8L11 5H15V14" />
  </svg>
);
export default CompactorIcon;
