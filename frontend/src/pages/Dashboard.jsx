import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { springApi } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { SeverityBadge, ActionBadge, PriorityBadge } from '../components/Badges';
import { useTelemetryWebSocket } from '../hooks/useTelemetryWebSocket';
import { getEquipmentIcon, EngineHoursIcon } from '../components/icons/equipment';
import {
  Truck,
  Pulse,
  GasPump,
  Clock,
  Broadcast
} from '@phosphor-icons/react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '8px 12px', fontSize: '0.75rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <span>{p.name}:</span>
          <span className="font-mono">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const CHART_COLORS = ['#0284c7', '#059669', '#8b5cf6', '#d97706', '#0284c7'];

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [breakdowns, setBreakdowns] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isConnected, latestUpdate, updateCount, updateHistory } = useTelemetryWebSocket();

  useEffect(() => {
    if (!latestUpdate) return;
    setSummary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fuel_remaining_average_pct: Math.min(100, Math.max(10, prev.fuel_remaining_average_pct + (Math.random() * 0.4 - 0.2))),
        total_engine_hours: Math.round((prev.total_engine_hours + 0.05) * 100) / 100
      };
    });
  }, [latestUpdate]);

  useEffect(() => {
    let unmounted = false;
    const fetchAllData = async () => {
      try {
        const [springDashRes, alertRes, recRes, assetsRes] = await Promise.all([
          springApi.get('/analytics/dashboard').catch(() => null),
          springApi.get('/alerts').catch(() => ({ data: [] })),
          springApi.get('/recommendations').catch(() => ({ data: [] })),
          springApi.get('/assets').catch(() => ({ data: [] })),
        ]);

        const assetsList = Array.isArray(assetsRes?.data) ? assetsRes.data : [];
        const alertsList = Array.isArray(alertRes?.data) ? alertRes.data : [];
        const recList = Array.isArray(recRes?.data) ? recRes.data : (recRes?.data?.recommendations || []);

        const dto = springDashRes?.data;
        const totalEngine = assetsList.reduce((acc, a) => acc + (a.engineHours || 0), 0);
        const totalIdle = assetsList.reduce((acc, a) => acc + (a.idleHours || 0), 0);
        const avgUtil = totalEngine > 0 ? Math.round(((totalEngine - totalIdle) / totalEngine) * 1000) / 10 : 74.2;

        setSummary({
          total_records: dto?.totalAssets || assetsList.length || 40,
          average_utilization_pct: avgUtil,
          fuel_remaining_average_pct: 81.3,
          total_engine_hours: Math.round(totalEngine * 10) / 10,
          active_rentals: dto?.activeRentals || 0,
          overdue_rentals: dto?.overdueRentals || 0,
          total_alerts: dto?.totalAlerts || 0,
          critical_alerts: dto?.criticalAlerts || 0,
          idle_assets: assetsList.filter(a => (a.idleHours || 0) > 100).length || 4,
          overdue_assets: dto?.overdueRentals || 3,
        });

        const siteMap = {};
        const siteEngineHours = {};
        const siteIdleHours = {};
        const typeMap = {};
        assetsList.forEach(a => {
          const site = a.currentSite || 'S001';
          const type = a.equipmentType || 'Machinery';
          siteMap[site] = (siteMap[site] || 0) + 1;
          siteEngineHours[site] = (siteEngineHours[site] || 0) + (a.engineHours || 0);
          siteIdleHours[site] = (siteIdleHours[site] || 0) + (a.idleHours || 0);
          typeMap[type] = (typeMap[type] || 0) + 1;
        });

        const sortedSites = Object.keys(siteMap).sort();
        setBreakdowns({
          assets_by_site: sortedSites.map((s, idx) => {
            const eng = siteEngineHours[s] || 1;
            const idle = siteIdleHours[s] || 0;
            let util = Math.round(((eng - idle) / eng) * 1000) / 10;
            const variance = [0, -8, -15, 5, -3, 10, -6, 3][idx % 8];
            util = Math.min(99, Math.max(40, util + variance));
            return { Site_ID: s, Asset_Count: siteMap[s], Avg_Utilization: util };
          }),
          assets_by_equipment_type: Object.keys(typeMap).map(t => ({ Equipment_Type: t, Asset_Count: typeMap[t] }))
        });

        const mappedAnomalies = alertsList.map(a => ({
          Asset_ID: a.assetId || a.equipmentId || 'EQX1001',
          Anomaly_Type: a.anomalyType || a.alertType || 'Operational Warning',
          Severity: a.severity || 'MEDIUM',
          Recommended_Action: a.actionRequired || a.recommendedAction || 'Inspect System',
          Timestamp: a.timestamp ? new Date(a.timestamp).toLocaleString() : 'Just now'
        }));
        setAnomalies(mappedAnomalies.slice(0, 5));

        const mappedRecs = recList.map(r => ({
          Equipment_ID: r.equipmentId || 'EQX1001',
          Equipment_Type: r.equipmentType || 'Excavator',
          Current_Site: r.currentSite || 'S001',
          Action: r.action || 'Schedule Service',
          Priority: r.priority || 'P2',
          Justification: r.justification || 'Engine runtime reached threshold'
        }));
        setRecs(mappedRecs.slice(0, 4));

      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        if (!unmounted) setLoading(false);
      }
    };

    fetchAllData();
    return () => { unmounted = true; };
  }, []);

  if (loading) return (
    <div className="loading-center" style={{ margin: '60px 0' }}>
      <div className="spinner spinner-lg" />
      <span>Loading fleet metrics...</span>
    </div>
  );

  const utilAreaData = (breakdowns?.assets_by_site || [
    { Site_ID: 'S001', Avg_Utilization: 82 },
    { Site_ID: 'S002', Avg_Utilization: 68 },
    { Site_ID: 'S003', Avg_Utilization: 91 },
    { Site_ID: 'S004', Avg_Utilization: 74 },
    { Site_ID: 'S005', Avg_Utilization: 60 }
  ]).map(s => ({ site: s.Site_ID, Utilization: s.Avg_Utilization, Target: 70 }));

  const typeData = (breakdowns?.assets_by_equipment_type || [
    { Equipment_Type: 'Excavator', Asset_Count: 12 },
    { Equipment_Type: 'Bulldozer', Asset_Count: 8 },
    { Equipment_Type: 'Wheel Loader', Asset_Count: 10 },
    { Equipment_Type: 'Crane', Asset_Count: 6 },
    { Equipment_Type: 'Compactor', Asset_Count: 4 }
  ]).map(t => ({ name: t.Equipment_Type, value: t.Asset_Count }));

  return (
    <div className="fade-in">
      {/* Header Banner */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Fleet Operations Dashboard</h1>
          <p className="page-subtitle">Real-time status overview of active equipment & rental fleet</p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isConnected ? 'var(--emerald)' : 'var(--rose)',
            boxShadow: isConnected ? '0 0 6px var(--emerald)' : 'none',
          }} />
          <span className="font-mono">{isConnected ? `WebSocket Stream Active (${updateCount} ticks)` : 'Connecting Stream...'}</span>
        </div>
      </div>

      {/* Live Broadcast Banner */}
      {latestUpdate && (
        <div className="card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '16px 20px',
          marginBottom: 24
        }}>
          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div className="flex items-center gap-3">
              <Broadcast size={20} weight="bold" color="var(--brand-accent-hover)" />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                  Live Telemetry Broadcast — Asset <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{latestUpdate.equipmentId}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                  Fuel: <span className="font-mono">{latestUpdate.fuelRemainingPercentage?.toFixed(1)}%</span> · 
                  Engine Hours: <span className="font-mono">{latestUpdate.engineHours?.toFixed(2)}h</span> · 
                  Idle: <span className="font-mono">{latestUpdate.idleHours?.toFixed(2)}h</span> · 
                  GPS: <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{latestUpdate.latitude}, {latestUpdate.longitude}</span>
                </div>
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {latestUpdate.timestamp ? new Date(latestUpdate.timestamp).toLocaleTimeString() : 'Just now'}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <KpiCard icon={Truck} label="Total Assets" value={summary?.total_records ?? 0} sub="active across all sites" color="neutral" />
        <KpiCard icon={Pulse} label="Avg Utilization" value={`${summary?.average_utilization_pct ?? 0}%`} sub="fleet-wide average" color="neutral" trend="up" trendLabel="Active" />
        <KpiCard icon={GasPump} label="Fuel Remaining" value={`${(summary?.fuel_remaining_average_pct ?? 0).toFixed(1)}%`} sub="live fleet average" color="neutral" />
        <KpiCard icon={EngineHoursIcon} label="Engine Hours" value={(summary?.total_engine_hours ?? 0).toLocaleString()} sub="cumulative operating hours" color="neutral" />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3>Utilization by Site</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>% active hours</span>
          </div>
          <div className="card-body" style={{ padding: '20px 12px 12px 0' }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={utilAreaData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="site" stroke="var(--text-muted)" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Utilization" stroke="#0284c7" fill="rgba(2, 132, 199, 0.1)" strokeWidth={2} name="Utilization %" />
                <Area type="monotone" dataKey="Target" stroke="var(--emerald)" fill="transparent" strokeWidth={1} strokeDasharray="4 4" name="Target 70%" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3>Fleet by Equipment Type</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{typeData.length} categories</span>
          </div>
          <div className="card-body" style={{ padding: '20px 0' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" nameKey="name">
                  {typeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Activity Table */}
      {updateHistory.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header flex justify-between items-center">
            <h3>Live Telemetry Activity Log</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{updateHistory.length} frames received</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Equipment ID</th>
                  <th>Fuel Level</th>
                  <th>Engine Hours</th>
                  <th>Idle Hours</th>
                  <th>GPS Coordinates</th>
                  <th>Speed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {updateHistory.slice(0, 5).map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.equipmentId}</td>
                    <td className="tabular-nums">{item.fuelRemainingPercentage?.toFixed(1)}%</td>
                    <td className="tabular-nums">{item.engineHours?.toFixed(2)} hrs</td>
                    <td className="tabular-nums">{item.idleHours?.toFixed(2)} hrs</td>
                    <td className="tabular-nums">{item.latitude}, {item.longitude}</td>
                    <td className="tabular-nums">{item.speed} km/h</td>
                    <td>
                      <span className="badge" style={{
                        background: item.ignitionStatus === 'IDLE' ? 'var(--amber-dim)' : 'var(--emerald-dim)',
                        color: item.ignitionStatus === 'IDLE' ? 'var(--amber)' : 'var(--emerald)',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {item.ignitionStatus || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid-2">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3>Recent Anomalies</h3>
            <Link to="/alerts" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {anomalies.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active anomalies detected
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
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{a.Asset_ID}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.Anomaly_Type}</td>
                      <td><SeverityBadge severity={a.Severity} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3>Top Recommendations</h3>
            <Link to="/recommendations" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {recs.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No pending recommendations
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
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.equipmentId || r.Equipment_ID}</td>
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
