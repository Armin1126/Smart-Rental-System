import React from 'react';

const BADGE_STYLES = {
  // Statuses
  AVAILABLE:   { bg: 'var(--emerald-dim)', color: 'var(--emerald)', border: '#a7f3d0' },
  RENTED:      { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' },
  IN_USE:      { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' },
  MAINTENANCE: { bg: 'var(--amber-dim)', color: 'var(--amber)', border: '#fde68a' },
  IDLE:        { bg: 'var(--slate-dim)', color: 'var(--slate)', border: '#cbd5e1' },
  
  // Severities / Priorities
  CRITICAL:    { bg: 'var(--rose-dim)', color: 'var(--rose)', border: '#fca5a5' },
  HIGH:        { bg: 'var(--amber-dim)', color: 'var(--amber)', border: '#fde68a' },
  MEDIUM:      { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' },
  LOW:         { bg: 'var(--slate-dim)', color: 'var(--slate)', border: '#cbd5e1' },

  // Custom Actions
  RIGHT_SIZE:  { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
  EXTENSION:   { bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' },
};

const BaseBadge = ({ text, styleKey }) => {
  const conf = BADGE_STYLES[styleKey] || { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: 'var(--border)' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: 4,
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      background: conf.bg,
      color: conf.color,
      border: `1px solid ${conf.border}`,
      lineHeight: 1
    }}>
      {text}
    </span>
  );
};

export const StatusBadge = ({ status = '' }) => {
  return <BaseBadge text={status} styleKey={status.toUpperCase()} />;
};

export const SeverityBadge = ({ severity = '' }) => {
  return <BaseBadge text={severity} styleKey={severity.toUpperCase()} />;
};

export const PriorityBadge = ({ priority = '' }) => {
  return <BaseBadge text={priority} styleKey={priority.toUpperCase()} />;
};

export const ActionBadge = ({ action = '' }) => {
  const a = action.toLowerCase();
  let key = 'LOW';
  if (a.includes('right-size') || a.includes('swap')) key = 'RIGHT_SIZE';
  else if (a.includes('proactive') || a.includes('extension offer')) key = 'EXTENSION';
  else if (a.includes('maintenance')) key = 'HIGH';
  else if (a.includes('return')) key = 'CRITICAL';
  else if (a.includes('refuel')) key = 'MEDIUM';
  return <BaseBadge text={action} styleKey={key} />;
};
