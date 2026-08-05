import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, springApi } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { SeverityBadge, ActionBadge, PriorityBadge } from '../components/Badges';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.75rem',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const TYPE_COLORS = ['#ffcd00','#10b981','#38bdf8','#f43f5e','#8b5cf6','#f97316','#06b6d4','#84cc16'];

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [breakdowns, setBreakdowns] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [dashRes, anomRes, recRes] = await Promise.all([
          analyticsApi.get('/dashboard'),
          analyticsApi.get('/anomalies'),
          springApi.get('/recommendations').catch(() => analyticsApi.get('/recommendations')),
        ]);
        setSummary(dashRes.data.summary);
        setBreakdowns(dashRes.data.breakdowns);
        const anomList = anomRes.data.anomalies || [];
        setAnomalies(anomList.slice(0, 5));
        const recList = Array.isArray(recRes.data) ? recRes.data : (recRes.data.recommendations || []);
        setRecs(recList.slice(0, 5));
      } catch (e) {
        setError('Failed to load dashboard. Is the FastAPI analytics server running on port 8000?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner spinner-lg" />
      <span>Loading dashboard data…</span>
    </div>
  );

  if (error) return (
    <div className="empty-state" style={{ marginTop: 60 }}>
      <div className="empty-icon">⚠️</div>
      <div className="empty-title">Unable to load dashboard</div>
      <div className="empty-desc">{error}</div>
    </div>
  );

  const siteData = (breakdowns?.assets_by_site || []).map(s => ({
    site: s.Site_ID,
    assets: s.Asset_Count,
    utilization: s.Avg_Utilization,
  }));

  const typeData = (breakdowns?.assets_by_equipment_type || []).map(t => ({
    name: t.Equipment_Type,
    value: t.Asset_Count,
  }));

  const utilAreaData = (breakdowns?.assets_by_site || []).map(s => ({
    site: s.Site_ID,
    Utilization: s.Avg_Utilization,
    Target: 70,
  }));

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your rental equipment fleet</p>
        </div>
        <Link to="/analytics" className="btn btn-primary">
          ⚡ Run Pipeline
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid-4 mb-6">
        <KpiCard icon="🚜" label="Total Assets" value={summary?.total_records ?? 0} sub="across all sites" color="amber" />
        <KpiCard icon="⚙️" label="Avg Utilization" value={`${summary?.average_utilization_pct ?? 0}%`} sub="fleet-wide average" color="emerald" trend="up" trendLabel="Active" />
        <KpiCard icon="⛽" label="Fuel Remaining" value={`${summary?.fuel_remaining_average_pct ?? 0}%`} sub="average across fleet" color="sky" />
        <KpiCard icon="🕐" label="Engine Hours" value={(summary?.total_engine_hours ?? 0).toLocaleString()} sub="cumulative hours" color="violet" />
      </div>
      <div className="grid-4 mb-6">
        <KpiCard icon="💤" label="Idle Assets" value={summary?.idle_assets ?? 0} sub="flagged for review" color="orange" />
        <KpiCard icon="⏰" label="Overdue Rentals" value={summary?.overdue_assets ?? 0} sub="require action" color="rose" trend="down" trendLabel="Action needed" />
        <KpiCard icon="⛽" label="Fuel Consumed" value={`${((summary?.total_fuel_used_liters ?? 0) / 1000).toFixed(1)}k L`} sub="total liters used" color="amber" />
        <KpiCard icon="💡" label="Recommendations" value={recs.length} sub="pending actions" color="violet" />
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-6">
        {/* Utilization by Site */}
        <div className="card">
          <div className="card-header">
            <h3>Utilization by Site</h3>
            <span className="text-xs text-muted">% active hours</span>
          </div>
          <div className="card-body" style={{ padding: '16px 8px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={utilAreaData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="site" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Utilization" stroke="#ffcd00" fill="rgba(255,205,0,0.15)" strokeWidth={2} name="Utilization %" />
                <Area type="monotone" dataKey="Target" stroke="#10b981" fill="transparent" strokeWidth={1} strokeDasharray="4 4" name="Target 70%" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Type Distribution */}
        <div className="card">
          <div className="card-header">
            <h3>Fleet by Equipment Type</h3>
            <span className="text-xs text-muted">{typeData.length} types</span>
          </div>
          <div className="card-body" style={{ padding: '16px 0' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" nameKey="name">
                  {typeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Assets by Site Bar Chart */}
      <div className="card mb-6">
        <div className="card-header">
          <h3>Assets & Utilization per Site</h3>
          <Link to="/assets" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        <div className="card-body" style={{ padding: '16px 8px' }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={siteData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="site" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="assets" fill="#38bdf8" name="Asset Count" radius={[3,3,0,0]} />
              <Bar yAxisId="right" dataKey="utilization" fill="#ffcd00" name="Avg Util %" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Recent Anomalies + Top Recommendations */}
      <div className="grid-2">
        {/* Recent Anomalies */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Anomalies</h3>
            <Link to="/alerts" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {anomalies.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px' }}>
                <div className="empty-icon">✅</div>
                <div className="empty-title">No anomalies detected</div>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Severity</th>
                </tr></thead>
                <tbody>
                  {anomalies.map((a, i) => (
                    <tr key={i}>
                      <td className="primary">{a.Asset_ID}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 200 }}>{a.Anomaly_Type}</td>
                      <td><SeverityBadge severity={a.Severity} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="card">
          <div className="card-header">
            <h3>Top Recommendations</h3>
            <Link to="/recommendations" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {recs.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px' }}>
                <div className="empty-icon">💡</div>
                <div className="empty-title">No pending recommendations</div>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th>Asset</th>
                  <th>Action</th>
                  <th>Priority</th>
                </tr></thead>
                <tbody>
                  {recs.map((r, i) => (
                    <tr key={i}>
                      <td className="primary">{r.equipmentId || r.Equipment_ID}</td>
                      <td><ActionBadge action={r.action || r.Action} /></td>
                      <td><PriorityBadge priority={r.priority || r.Priority} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
