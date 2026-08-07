import React from 'react';

/** Sparkline utilization bar: value% filled, remainder idle */
export const SparkBar = ({ value = 0, max = 100, color }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (
    pct < 20 ? 'var(--rose)' :
    pct < 50 ? 'var(--amber)' :
    'var(--emerald)'
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <span className="tabular-nums" style={{ minWidth: 38, color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.78rem' }}>{pct.toFixed(0)}%</span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};

/** Dual bar: utilization vs idle split */
export const DualSparkBar = ({ utilPct = 0, idlePct = 0 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 170, padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: 32, fontWeight: 600 }}>Util</span>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, utilPct)}%`, height: '100%',
            background: utilPct < 25 ? 'var(--rose)' : utilPct < 50 ? 'var(--amber)' : 'var(--emerald)'
          }} />
        </div>
        <span className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 700, minWidth: 42, textAlign: 'right' }}>{utilPct?.toFixed(1)}%</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: 32, fontWeight: 600 }}>Idle</span>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, idlePct)}%`, height: '100%',
            background: idlePct > 65 ? 'var(--rose)' : 'var(--slate)'
          }} />
        </div>
        <span className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, minWidth: 42, textAlign: 'right' }}>{idlePct?.toFixed(1)}%</span>
      </div>
    </div>
  );
};
