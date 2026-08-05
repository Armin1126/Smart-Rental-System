import React from 'react';

/**
 * StatusBadge — for asset status (AVAILABLE, RENTED, MAINTENANCE, IDLE)
 */
export const StatusBadge = ({ status = '' }) => {
  const s = status.toUpperCase();
  const cls =
    s === 'AVAILABLE'   ? 'badge badge-available' :
    s === 'RENTED'      ? 'badge badge-rented' :
    s === 'MAINTENANCE' ? 'badge badge-maintenance' :
    s === 'IN_USE'      ? 'badge badge-rented' :
    'badge badge-idle';

  return <span className={cls}>{status}</span>;
};

/**
 * SeverityBadge — for alert/anomaly severity (CRITICAL, HIGH, MEDIUM, LOW)
 */
export const SeverityBadge = ({ severity = '' }) => {
  const s = severity.toUpperCase();
  const cls =
    s === 'CRITICAL' ? 'badge badge-critical' :
    s === 'HIGH'     ? 'badge badge-high' :
    s === 'MEDIUM'   ? 'badge badge-medium' :
    s === 'LOW'      ? 'badge badge-low' :
    'badge badge-info';

  return <span className={cls}>{severity}</span>;
};

/**
 * PriorityBadge — for recommendation priority
 */
export const PriorityBadge = ({ priority = '' }) => {
  const p = priority.toUpperCase();
  const cls =
    p === 'CRITICAL' ? 'badge badge-critical' :
    p === 'HIGH'     ? 'badge badge-high' :
    p === 'MEDIUM'   ? 'badge badge-medium' :
    'badge badge-low';
  return <span className={cls}>{priority}</span>;
};

/**
 * ActionBadge — for recommendation action types
 */
export const ActionBadge = ({ action = '' }) => {
  const a = action.toLowerCase();
  const cls =
    a.includes('maintenance') ? 'badge badge-action-maintenance' :
    a.includes('return')      ? 'badge badge-action-return' :
    a.includes('move')        ? 'badge badge-action-move' :
    a.includes('refuel')      ? 'badge badge-action-refuel' :
    a.includes('extend')      ? 'badge badge-action-extend' :
    'badge badge-info';
  return <span className={cls}>{action}</span>;
};
