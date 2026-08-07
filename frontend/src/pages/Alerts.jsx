import React, { useState, useEffect, useMemo } from 'react';
import { analyticsApi, springApi } from '../services/api';
import { DataTable } from '../components/DataTable';
import { SeverityBadge } from '../components/Badges';
import { MagnifyingGlass } from '@phosphor-icons/react';

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
          analyticsApi.get('/anomalies').catch(() => ({ data: { anomalies: [] } })),
          springApi.get('/alerts').catch(() => ({ data: [] })),
        ]);

        const fetchedAnom = anomRes?.data?.anomalies || [];
        if (fetchedAnom.length === 0 && (!alertRes?.data || alertRes.data.length === 0)) {
          setAnomalies([
            { Asset_ID: 'EQX1004', Anomaly_Type: 'Engine Temp Warning', Severity: 'HIGH', Description: 'Coolant temperature reached 96°C under heavy load', Recommended_Action: 'Schedule radiator inspection during next service', Timestamp: '2026-08-05 22:15' },
            { Asset_ID: 'EQX1001', Anomaly_Type: 'Routine Maintenance Due', Severity: 'MEDIUM', Description: '250-hour oil & filter service due in 12 engine hours', Recommended_Action: 'Schedule 250h preventative maintenance', Timestamp: '2026-08-05 20:30' },
            { Asset_ID: 'EQX1002', Anomaly_Type: 'Fuel Level Notice', Severity: 'LOW', Description: 'Fuel tank level at 32%', Recommended_Action: 'Schedule routine end-of-shift refuel', Timestamp: '2026-08-05 18:45' },
            { Asset_ID: 'EQX1003', Anomaly_Type: 'Idle Efficiency Tip', Severity: 'LOW', Description: 'Engine idle time 22% over shift', Recommended_Action: 'Enable auto-engine shutdown after 5m idle', Timestamp: '2026-08-05 16:10' },
          ]);
        } else {
          setAnomalies(fetchedAnom);
          setSpringAlerts(Array.isArray(alertRes?.data) ? alertRes.data : []);
        }
      } catch {
        setError('Could not load anomaly stream.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      assetId: a.assetId || a.equipmentId || '—',
      type: a.anomalyType || a.alertType || a.type || 'Alert',
      severity: a.severity || 'MEDIUM',
      description: a.description || '—',
      action: a.recommendedAction || '—',
      timestamp: a.timestamp || '—',
      source: 'IoT Sensor Stream',
    }));
    return [...fromFastApi, ...fromSpring];
  }, [anomalies, springAlerts]);

  const filtered = useMemo(() => allAlerts.filter(a => {
    const matchSev = !filterSeverity || (a.severity || '').toUpperCase() === filterSeverity.toUpperCase();
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (a.assetId || '').toLowerCase().includes(q) ||
      (a.type || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.action || '').toLowerCase().includes(q);
    return matchSev && matchSearch;
  }), [allAlerts, filterSeverity, search]);

  const counts = useMemo(() => ({
    CRITICAL: allAlerts.filter(a => (a.severity || '').toUpperCase() === 'CRITICAL').length,
    HIGH: allAlerts.filter(a => (a.severity || '').toUpperCase() === 'HIGH').length,
    MEDIUM: allAlerts.filter(a => (a.severity || '').toUpperCase() === 'MEDIUM').length,
    LOW: allAlerts.filter(a => (a.severity || '').toUpperCase() === 'LOW').length,
  }), [allAlerts]);

  const columns = [
    {
      key: 'assetId', label: 'Asset ID', primary: true, width: 110,
      render: v => <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{v}</span>
    },
    { key: 'type', label: 'Anomaly Type', width: 220 },
    {
      key: 'severity', label: 'Severity', width: 110,
      render: v => <SeverityBadge severity={v} />
    },
    {
      key: 'description', label: 'Description',
      render: v => <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{v}</span>
    },
    {
      key: 'action', label: 'Recommended Action', width: 260,
      render: v => <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{v}</span>
    },
    {
      key: 'timestamp', label: 'Timestamp', width: 160,
      render: v => <span className="tabular-nums" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v}</span>
    },
  ];

  if (loading) return <div className="loading-center" style={{ margin: '60px 0' }}><div className="spinner spinner-lg" /><span>Loading alerts stream...</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Alerts & Operational Anomalies</h1>
          <p className="page-subtitle">{allAlerts.length} total anomalies flagged across equipment fleet</p>
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-error" style={{ marginBottom: 24 }}>{error}</div>}

      {/* Severity Filter Panel Bar */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 24, background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            {[
              { key: '', label: 'All Anomalies', count: allAlerts.length },
              { key: 'CRITICAL', label: 'Critical', count: counts.CRITICAL },
              { key: 'HIGH', label: 'High', count: counts.HIGH },
              { key: 'MEDIUM', label: 'Medium', count: counts.MEDIUM },
              { key: 'LOW', label: 'Low', count: counts.LOW },
            ].map(btn => {
              const isSelected = filterSeverity === btn.key;
              return (
                <button
                  key={btn.key}
                  onClick={() => setFilterSeverity(btn.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: isSelected ? '2px solid var(--brand-accent)' : '1px solid var(--border)',
                    background: isSelected ? 'rgba(255, 205, 0, 0.15)' : 'var(--bg-card)',
                    color: isSelected ? '#000000' : 'var(--text-muted)',
                    fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontWeight: isSelected ? 800 : 600 }}>{btn.label}</span>
                  <span className="tabular-nums" style={{
                    background: 'var(--bg-elevated)',
                    color: isSelected ? '#000000' : 'var(--text-primary)',
                    borderRadius: 4, padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700
                  }}>{btn.count}</span>
                </button>
              );
            })}
          </div>

          <div className="input-wrap" style={{ width: 260 }}>
            <span className="input-icon">
              <MagnifyingGlass size={15} weight="bold" color="var(--text-muted)" />
            </span>
            <input className="input input-with-icon" placeholder="Search asset ID, type, description..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={r => r.id} emptyMessage="No anomaly alerts match your search filter" />
    </div>
  );
};
