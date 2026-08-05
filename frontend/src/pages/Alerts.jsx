import React, { useState, useEffect, useMemo } from 'react';
import { analyticsApi, springApi } from '../services/api';
import { DataTable } from '../components/DataTable';
import { SeverityBadge } from '../components/Badges';

export const Alerts = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [springAlerts, setSpringAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [anomRes, alertRes] = await Promise.all([
          analyticsApi.get('/anomalies'),
          springApi.get('/alerts').catch(() => ({ data: [] })),
        ]);
        setAnomalies(anomRes.data.anomalies || []);
        setSpringAlerts(Array.isArray(alertRes.data) ? alertRes.data : []);
      } catch {
        setError('Could not load alerts. Is FastAPI running on port 8000?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Merge and normalise
  const allAlerts = useMemo(() => {
    const fromFastApi = anomalies.map(a => ({
      id: `FA-${a.Asset_ID}-${a.Timestamp}`,
      assetId: a.Asset_ID,
      type: a.Anomaly_Type,
      severity: a.Severity,
      description: a.Description,
      action: a.Recommended_Action,
      timestamp: a.Timestamp,
      source: 'AI Engine',
    }));
    const fromSpring = springAlerts.map(a => ({
      id: `SP-${a.id}`,
      assetId: a.equipmentId || '—',
      type: a.alertType || a.type || 'Alert',
      severity: a.severity || 'MEDIUM',
      description: a.description || '—',
      action: a.recommendedAction || '—',
      timestamp: a.timestamp || '—',
      source: 'Spring Boot',
    }));
    return [...fromFastApi, ...fromSpring];
  }, [anomalies, springAlerts]);

  const filtered = useMemo(() => allAlerts.filter(a => {
    const matchSev = !filterSeverity || a.severity?.toUpperCase() === filterSeverity;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (a.assetId || '').toLowerCase().includes(q) ||
      (a.type || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q);
    return matchSev && matchSearch;
  }), [allAlerts, filterSeverity, search]);

  const counts = useMemo(() => ({
    CRITICAL: allAlerts.filter(a => a.severity === 'CRITICAL').length,
    HIGH: allAlerts.filter(a => a.severity === 'HIGH').length,
    MEDIUM: allAlerts.filter(a => a.severity === 'MEDIUM').length,
    LOW: allAlerts.filter(a => a.severity === 'LOW').length,
  }), [allAlerts]);

  const columns = [
    {
      key: 'assetId', label: 'Asset ID', primary: true, width: 110,
      render: v => <span style={{ color: 'var(--amber)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
    },
    { key: 'type', label: 'Anomaly Type', width: 220 },
    {
      key: 'severity', label: 'Severity', width: 110,
      render: v => <SeverityBadge severity={v} />
    },
    {
      key: 'description', label: 'Description',
      render: v => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v}</span>
    },
    {
      key: 'action', label: 'Recommended Action', width: 260,
      render: v => <span style={{ fontSize: '0.75rem', color: 'var(--sky)' }}>{v}</span>
    },
    {
      key: 'timestamp', label: 'Timestamp', width: 160,
      render: v => <span className="font-mono text-xs text-muted">{v}</span>
    },
    {
      key: 'source', label: 'Source', width: 100, sortable: false,
      render: v => (
        <span className="badge badge-info" style={{ fontSize: '0.62rem' }}>{v}</span>
      )
    },
  ];

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /><span>Loading alerts…</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alerts & Anomalies</h1>
          <p className="page-subtitle">{allAlerts.length} total — AI engine + fleet monitoring</p>
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-error">⚠️ {error}</div>}

      {/* Severity Summary Pills */}
      <div className="flex gap-3 mb-5" style={{ flexWrap: 'wrap' }}>
        {[
          { key: '', label: 'All', count: allAlerts.length, cls: 'btn-secondary' },
          { key: 'CRITICAL', label: 'Critical', count: counts.CRITICAL, cls: 'badge-critical' },
          { key: 'HIGH',     label: 'High',     count: counts.HIGH,     cls: 'badge-high' },
          { key: 'MEDIUM',   label: 'Medium',   count: counts.MEDIUM,   cls: 'badge-medium' },
          { key: 'LOW',      label: 'Low',      count: counts.LOW,      cls: 'badge-low' },
        ].map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilterSeverity(btn.key)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: filterSeverity === btn.key ? 'var(--bg-elevated)' : 'transparent',
              color: filterSeverity === btn.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {btn.label}
            <span style={{
              background: btn.key === 'CRITICAL' ? 'var(--rose)' : btn.key === 'HIGH' ? 'var(--orange)' :
                btn.key === 'MEDIUM' ? '#b8860b' : btn.key === 'LOW' ? 'var(--sky)' : 'var(--bg-hover)',
              color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700,
            }}>{btn.count}</span>
          </button>
        ))}
        <div className="input-wrap" style={{ flex: '1 1 260px', marginLeft: 'auto' }}>
          <span className="input-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input className="input input-with-icon" placeholder="Search asset, type, description…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={r => r.id} emptyMessage="No alerts match your filters" />
    </div>
  );
};
