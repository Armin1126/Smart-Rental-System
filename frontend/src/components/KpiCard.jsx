import React from 'react';

export const KpiCard = ({ icon, label, value, sub, trend, trendLabel, color = 'amber' }) => {
  const colorMap = {
    amber:   { bg: 'var(--amber-dim)',   text: 'var(--amber)',   dot: '#ffcd00' },
    emerald: { bg: 'var(--emerald-dim)', text: 'var(--emerald)', dot: '#10b981' },
    rose:    { bg: 'var(--rose-dim)',    text: 'var(--rose)',    dot: '#f43f5e' },
    sky:     { bg: 'var(--sky-dim)',     text: 'var(--sky)',     dot: '#38bdf8' },
    violet:  { bg: 'var(--violet-dim)', text: 'var(--violet)',  dot: '#8b5cf6' },
    orange:  { bg: 'var(--orange-dim)', text: 'var(--orange)',  dot: '#f97316' },
  };
  const c = colorMap[color] || colorMap.amber;

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—';
  const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral';

  return (
    <div className="kpi-card fade-in">
      <div className="flex items-center justify-between">
        <div className="kpi-icon" style={{ background: c.bg }}>
          <span style={{ color: c.text, fontSize: 18, lineHeight: 1 }}>{icon}</span>
        </div>
        {trend && (
          <span className={`kpi-trend ${trendClass}`}>
            {trendIcon} {trendLabel}
          </span>
        )}
      </div>
      <div>
        <div className="kpi-value">{value ?? '—'}</div>
        <div className="kpi-label mt-1">{label}</div>
        {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
      </div>
    </div>
  );
};
