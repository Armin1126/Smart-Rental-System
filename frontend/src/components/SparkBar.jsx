import React from 'react';

/** Sparkline utilization bar: value% filled, remainder idle */
export const SparkBar = ({ value = 0, max = 100, color }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (
    pct < 20 ? 'var(--rose)' :
    pct < 50 ? 'var(--orange)' :
    pct < 70 ? 'var(--amber)' :
    'var(--emerald)'
  );

  return (
    <div className="spark-bar-wrap">
      <span style={{ minWidth: 36, color: barColor, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
      <div className="spark-bar-track">
        <div className="spark-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  );
};

/** Dual bar: utilization vs idle split */
export const DualSparkBar = ({ utilPct = 0, idlePct = 0 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 160 }}>
      <div className="spark-bar-wrap" style={{ gap: 6 }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', minWidth: 44 }}>Util</span>
        <div className="spark-bar-track" style={{ flex: 1 }}>
          <div className="spark-bar-fill" style={{
            width: `${Math.min(100, utilPct)}%`,
            background: utilPct < 25 ? 'var(--rose)' : utilPct < 50 ? 'var(--amber)' : 'var(--emerald)'
          }} />
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, minWidth: 32 }}>{utilPct?.toFixed(1)}%</span>
      </div>
      <div className="spark-bar-wrap" style={{ gap: 6 }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', minWidth: 44 }}>Idle</span>
        <div className="spark-bar-track" style={{ flex: 1 }}>
          <div className="spark-bar-fill" style={{
            width: `${Math.min(100, idlePct)}%`,
            background: idlePct > 70 ? 'var(--rose)' : 'var(--text-muted)'
          }} />
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, minWidth: 32 }}>{idlePct?.toFixed(1)}%</span>
      </div>
    </div>
  );
};
