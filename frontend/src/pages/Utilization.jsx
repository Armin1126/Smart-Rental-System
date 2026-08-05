import React, { useState, useEffect, useMemo } from 'react';
import { analyticsApi } from '../services/api';
import { DataTable } from '../components/DataTable';
import { DualSparkBar } from '../components/SparkBar';
import { KpiCard } from '../components/KpiCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.75rem' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>)}
    </div>
  );
};

const REC_COLORS = { 'Return Early': '#f43f5e', 'Reallocate': '#8b5cf6', 'Monitor Usage': '#38bdf8' };

export const Utilization = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRec, setFilterRec] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.get('/utilization');
        setData(res.data);
      } catch {
        setError('Could not load utilization data. Is FastAPI running on port 8000?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const items = data?.underutilized_assets || [];

  const recTypes = useMemo(() => [...new Set(items.map(i => i.Recommendation).filter(Boolean))], [items]);

  const filtered = useMemo(() => items.filter(a => {
    const matchRec = !filterRec || a.Recommendation === filterRec;
    const q = search.toLowerCase();
    const matchSearch = !q || (a.Asset_ID || '').toLowerCase().includes(q) || (a.Equipment_Type || '').toLowerCase().includes(q);
    return matchRec && matchSearch;
  }), [items, filterRec, search]);

  const chartData = useMemo(() => {
    const grouped = {};
    items.forEach(a => {
      const k = a.Equipment_Type || 'Other';
      if (!grouped[k]) grouped[k] = { type: k, count: 0, avgUtil: 0, avgIdle: 0 };
      grouped[k].count++;
      grouped[k].avgUtil += parseFloat(a.Utilization_Pct || 0);
      grouped[k].avgIdle += parseFloat(a.Idle_Pct || 0);
    });
    return Object.values(grouped).map(g => ({
      type: g.type.length > 12 ? g.type.substring(0, 12) + '…' : g.type,
      Count: g.count,
      'Avg Util %': (g.avgUtil / g.count).toFixed(1),
    }));
  }, [items]);

  const columns = [
    {
      key: 'Asset_ID', label: 'Asset ID', primary: true, width: 110,
      render: v => <span style={{ color: 'var(--amber)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
    },
    { key: 'Equipment_Type', label: 'Type', width: 150 },
    {
      key: 'Current_Site', label: 'Site', width: 90,
      render: v => <span className="badge badge-info">{v}</span>
    },
    {
      key: 'Utilization_Pct', label: 'Utilization vs Idle',
      sortable: true, width: 220,
      render: (v, row) => <DualSparkBar utilPct={parseFloat(v || 0)} idlePct={parseFloat(row.Idle_Pct || 0)} />
    },
    {
      key: 'Recommendation', label: 'Recommended Action', width: 180,
      render: v => {
        const color = REC_COLORS[v] || 'var(--sky)';
        return <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>{v}</span>;
      }
    },
    {
      key: 'Recommendation_Reason', label: 'Reason',
      render: v => <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v}</span>
    },
  ];

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /><span>Loading utilization data…</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Under-Utilization Analysis</h1>
          <p className="page-subtitle">Assets flagged with less than 30% utilization or more than 70% idle time</p>
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-error">⚠️ {error}</div>}

      {/* KPIs */}
      <div className="grid-3 mb-5">
        <KpiCard icon="📊" label="Total Flagged Assets" value={data?.total_flagged_assets ?? 0} sub="requiring action" color="rose" />
        <KpiCard icon="↩️" label="Return Early" value={items.filter(i => i.Recommendation === 'Return Early').length} sub="extreme under-utilization" color="orange" />
        <KpiCard icon="🔄" label="Reallocate / Monitor" value={items.filter(i => i.Recommendation !== 'Return Early').length} sub="low or high idle" color="amber" />
      </div>

      {/* Chart */}
      <div className="card mb-5">
        <div className="card-header">
          <h3>Flagged Assets by Equipment Type</h3>
          <span className="text-xs text-muted">average utilization %</span>
        </div>
        <div className="card-body" style={{ padding: '16px 8px' }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="Count" fill="#f43f5e" name="Flagged Count" radius={[3,3,0,0]} />
              <Bar yAxisId="right" dataKey="Avg Util %" fill="#ffcd00" name="Avg Util %" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="input-wrap" style={{ flex: '1 1 260px' }}>
          <span className="input-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input className="input input-with-icon" placeholder="Search asset ID or type…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" value={filterRec} onChange={e => setFilterRec(e.target.value)}>
          <option value="">All Actions</option>
          {recTypes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={r => r.Asset_ID} emptyMessage="No under-utilized assets match your filters" />
    </div>
  );
};
