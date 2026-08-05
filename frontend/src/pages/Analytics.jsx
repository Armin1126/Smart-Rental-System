import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STAGES = [
  { key: 'dataset',    icon: '💾', label: 'Dataset Generation',    desc: 'assets · sites · operators · rentals · telemetry' },
  { key: 'preprocess', icon: '⚙️', label: 'Preprocessing',          desc: 'processed_dataset.csv · extended/long-term contracts' },
  { key: 'dashboard',  icon: '📊', label: 'Dashboard Analytics',    desc: 'KPIs · site breakdowns · equipment type analysis' },
  { key: 'underutil',  icon: '📉', label: 'Under-Utilization',      desc: 'flagged assets · Return Early / Reallocate' },
  { key: 'anomaly',    icon: '🔍', label: 'Anomaly Detection',       desc: 'engine critical · overheating · overdue · fuel low' },
  { key: 'forecast',   icon: '📈', label: 'Demand Forecasting',      desc: '3-month moving average · confidence scoring' },
  { key: 'recs',       icon: '💡', label: 'Recommendation Engine',  desc: 'recommendations.json · action + priority generation' },
];

const ANOMALY_COLORS = { CRITICAL: '#f43f5e', HIGH: '#f97316', MEDIUM: '#ffcd00', LOW: '#38bdf8' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.75rem' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || 'var(--amber)', fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export const Analytics = () => {
  const [running, setRunning] = useState(false);
  const [stageStatus, setStageStatus] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [apiOnline, setApiOnline] = useState(null);
  const [anomalyData, setAnomalyData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [dashSummary, setDashSummary] = useState(null);

  // Check API status on mount + load charts
  useEffect(() => {
    const init = async () => {
      try {
        await analyticsApi.get('/');
        setApiOnline(true);
      } catch { setApiOnline(false); }
      try {
        const [anomRes, dashRes] = await Promise.all([
          analyticsApi.get('/anomalies'),
          analyticsApi.get('/dashboard'),
        ]);
        // Aggregate anomalies by severity
        const anomList = anomRes.data.anomalies || [];
        const sevCount = {};
        anomList.forEach(a => { sevCount[a.Severity] = (sevCount[a.Severity] || 0) + 1; });
        setAnomalyData(Object.entries(sevCount).map(([sev, count]) => ({ sev, count })));
        setDashSummary(dashRes.data.summary);
      } catch {}
    };
    init();
  }, []);

  const triggerPipeline = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    setStageStatus({});
    setElapsed(0);

    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 200);

    // Animate stages as request runs
    const stageKeys = STAGES.map(s => s.key);
    const animateTask = (async () => {
      for (const key of stageKeys) {
        setStageStatus(p => ({ ...p, [key]: 'running' }));
        await new Promise(r => setTimeout(r, 700));
      }
    })();

    try {
      const [res] = await Promise.all([
        analyticsApi.post('/generate?records=50'),
        animateTask,
      ]);
      const done = {};
      stageKeys.forEach(k => done[k] = 'done');
      setStageStatus(done);
      setResult(res.data);
      // Refresh charts
      const [anomRes, dashRes] = await Promise.all([
        analyticsApi.get('/anomalies'),
        analyticsApi.get('/dashboard'),
      ]);
      const anomList = anomRes.data.anomalies || [];
      const sevCount = {};
      anomList.forEach(a => { sevCount[a.Severity] = (sevCount[a.Severity] || 0) + 1; });
      setAnomalyData(Object.entries(sevCount).map(([sev, count]) => ({ sev, count })));
      setDashSummary(anomRes.data.summary || dashRes.data.summary);
    } catch (e) {
      const failed = {};
      stageKeys.forEach(k => failed[k] = 'error');
      setStageStatus(failed);
      setError(e?.response?.data?.detail || 'Pipeline failed. Check if FastAPI is running on port 8000.');
    } finally {
      clearInterval(timer);
      setElapsed(Math.floor((Date.now() - start) / 1000));
      setRunning(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Analytics Pipeline</h1>
          <p className="page-subtitle">End-to-end synthetic data generation, anomaly detection, forecasting, and recommendations</p>
        </div>
        {/* API Status */}
        <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: apiOnline ? 'var(--emerald)' : apiOnline === false ? 'var(--rose)' : 'var(--text-muted)' }}>
          <span className="live-dot" style={{ background: apiOnline ? 'var(--emerald)' : apiOnline === false ? 'var(--rose)' : 'var(--text-muted)' }} />
          {apiOnline === true ? 'FastAPI online · :8000' : apiOnline === false ? 'FastAPI offline' : 'Checking…'}
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-error">⚠️ {error}</div>}
      {result?.status === 'SUCCESS' && (
        <div className="alert-banner alert-banner-success">✅ Pipeline completed successfully in {elapsed}s — {result.artifacts_updated?.length} artifacts updated</div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Pipeline Control */}
        <div className="card">
          <div style={{ background: '#0d1117', padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--amber)' }}>⚡</span> Pipeline Control
            </span>
            {running && (
              <span style={{ fontSize: '0.75rem', color: 'var(--amber)', fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="live-dot" style={{ background: 'var(--amber)' }} />
                {elapsed}s elapsed
              </span>
            )}
          </div>

          <div className="card-body space-y-4">
            {/* Trigger Button */}
            <button
              onClick={triggerPipeline}
              disabled={running || !apiOnline}
              className="btn btn-primary btn-lg w-full"
              style={{ justifyContent: 'center' }}
            >
              {running ? (
                <><span className="live-dot" style={{ background: '#111' }} /> Running Pipeline…</>
              ) : (
                <>⚡ Generate Synthetic Telemetry Data</>
              )}
            </button>

            {/* Stage Progress */}
            <div className="space-y-4">
              {STAGES.map(stage => {
                const status = stageStatus[stage.key];
                const isDone    = status === 'done';
                const isRunning = status === 'running';
                const isError   = status === 'error';

                return (
                  <div key={stage.key} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '10px 12px', borderRadius: 8,
                    border: `1px solid ${isDone ? '#10b98133' : isRunning ? '#ffcd0033' : isError ? '#f43f5e33' : 'var(--border-subtle)'}`,
                    background: isDone ? '#10b98108' : isRunning ? '#ffcd0008' : isError ? '#f43f5e08' : 'transparent',
                    transition: 'all 0.3s',
                  }}>
                    <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>
                      {isRunning ? <span className="live-dot" style={{ width: 10, height: 10, background: 'var(--amber)' }} /> :
                       isDone ? '✅' : isError ? '❌' : <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--border)' }} />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isDone ? 'var(--emerald)' : isRunning ? 'var(--amber)' : isError ? 'var(--rose)' : 'var(--text-secondary)' }}>
                        {stage.icon} {stage.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{stage.desc}</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
                      color: isDone ? 'var(--emerald)' : isRunning ? 'var(--amber)' : isError ? 'var(--rose)' : 'var(--text-muted)' }}>
                      {isDone ? 'Done' : isRunning ? 'Running' : isError ? 'Failed' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Charts + Artifacts */}
        <div className="space-y-5">
          {/* Anomaly Distribution */}
          {anomalyData.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3>Anomalies by Severity</h3>
                <span className="text-xs text-muted">{anomalyData.reduce((s, a) => s + a.count, 0)} total</span>
              </div>
              <div className="card-body" style={{ padding: '12px 8px' }}>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={anomalyData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sev" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Count" radius={[3,3,0,0]}>
                      {anomalyData.map((entry, i) => (
                        <Cell key={i} fill={ANOMALY_COLORS[entry.sev] || '#ffcd00'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Fleet Stats */}
          {dashSummary && (
            <div className="card">
              <div className="card-header">
                <h3>Fleet Metrics (Latest Run)</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Total Records', value: dashSummary.total_records },
                    { label: 'Avg Utilization', value: `${dashSummary.average_utilization_pct}%` },
                    { label: 'Engine Hours', value: (dashSummary.total_engine_hours || 0).toLocaleString() },
                    { label: 'Fuel Remaining', value: `${dashSummary.fuel_remaining_average_pct}%` },
                    { label: 'Overdue Assets', value: dashSummary.overdue_assets },
                    { label: 'Idle Assets', value: dashSummary.idle_assets },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Artifacts list on success */}
          {result?.artifacts_updated && (
            <div className="card">
              <div style={{ background: '#0d3320', padding: '12px 20px', borderBottom: '1px solid #10b98133' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald)' }}>✅ Artifacts Updated</span>
              </div>
              <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {result.artifacts_updated.map(f => (
                  <div key={f} style={{ padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 6, fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
