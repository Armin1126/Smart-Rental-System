import React from 'react';

export const KpiCard = ({ icon: Icon, label, value, sub, trend, trendLabel, color = 'neutral' }) => {
  const statusColor = color === 'rose' ? 'var(--rose)' : color === 'amber' ? 'var(--amber)' : color === 'emerald' ? 'var(--emerald)' : 'var(--text-primary)';

  return (
    <div className="card fade-in" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {label}
        </span>
        {Icon ? (
          typeof Icon === 'function' || typeof Icon === 'object' ? <Icon size={18} weight="bold" color="var(--text-muted)" /> : Icon
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2, marginBottom: 4 }}>
        <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 800, color: statusColor, lineHeight: 1.1 }}>
          {value ?? '—'}
        </span>
        {trend && (
          <span className="badge" style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            color: trend === 'up' ? 'var(--emerald)' : 'var(--rose)',
            background: trend === 'up' ? 'var(--emerald-dim)' : 'var(--rose-dim)',
            padding: '2px 6px',
            borderRadius: 4
          }}>
            {trend === 'up' ? '↑' : '↓'} {trendLabel || ''}
          </span>
        )}
      </div>

      {sub && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</span>}
    </div>
  );
};

