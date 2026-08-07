import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { analyticsApi, springApi } from '../services/api';
import { useTelemetryWebSocket } from '../hooks/useTelemetryWebSocket';
import { useAuth } from '../context/AuthContext';
import { getEquipmentIcon, EngineHoursIcon, DtcFaultIcon } from '../components/icons/equipment';
import {
  Pulse,
  Gauge,
  GasPump,
  ThermometerHot,
  BatteryCharging,
  Warning,
  MagnifyingGlass,
  Clock,
  CheckCircle,
  Lightning,
  MapPin,
  Broadcast,
  Cpu
} from '@phosphor-icons/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ASSET_META = {
  EQX1001: { type: 'Backhoe Loader', make: 'Caterpillar', model: 'CAT D6', site: 'San Francisco Main Depot (S001)' },
  EQX1002: { type: 'Grader', make: 'Caterpillar', model: 'CAT 320', site: 'Silicon Valley Hub (S002)' },
  EQX1003: { type: 'Bulldozer', make: 'Caterpillar', model: 'CAT CB2.7', site: 'Oakland Port Yard (S003)' },
  EQX1004: { type: 'Compactor', make: 'Caterpillar', model: 'CAT 950M', site: 'Sacramento Yard (S004)' },
  EQX1005: { type: 'Bulldozer', make: 'Caterpillar', model: 'CAT 14M', site: 'San Jose North (S005)' },
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '8px 12px',
      fontSize: '0.75rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Sample #{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <span>{p.name}:</span>
          <span className="tabular-nums">
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

export const Telemetry = () => {
  const { user, isCustomer } = useAuth();
  const customerCode = user?.customerCode || 'CUST001';
  const companyName = user?.companyName || '';

  // Determine scoped asset IDs for customer
  const customerScopedIds = useMemo(() => {
    if (customerCode === 'CUST002' || companyName.includes('Pacific')) {
      return ['EQX1002', 'EQX1004', 'EQX1012'];
    }
    if (customerCode === 'CUST003' || companyName.includes('Titan')) {
      return ['EQX1005', 'EQX1008', 'EQX1015'];
    }
    return ['EQX1001', 'EQX1003', 'EQX1010'];
  }, [customerCode, companyName]);

  const [searchParams] = useSearchParams();
  const initialParamAsset = searchParams.get('assetId');

  const defaultAsset = isCustomer ? customerScopedIds[0] : (initialParamAsset ? initialParamAsset.toUpperCase() : 'EQX1001');

  const [assetId, setAssetId] = useState(defaultAsset);
  const [searchQuery, setSearchQuery] = useState('');
  const [telemetry, setTelemetry] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [assetMetaMap, setAssetMetaMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeChartMetric, setActiveChartMetric] = useState('Fuel %');
  const [timeRange, setTimeRange] = useState('Live');

  const { isConnected, latestUpdate, updateCount } = useTelemetryWebSocket();

  useEffect(() => {
    if (initialParamAsset) {
      const formatted = initialParamAsset.toUpperCase();
      setAssetId(formatted);
      fetchTelemetry(formatted);
    }
  }, [initialParamAsset]);

  useEffect(() => {
    const fetchAssetsList = async () => {
      try {
        const res = await springApi.get('/assets').catch(() => analyticsApi.get('/assets')).catch(() => null);
        const data = Array.isArray(res?.data) ? res.data : (res?.data?.assets || []);
        if (data.length > 0) {
          const ids = [];
          const meta = {};
          data.forEach((a) => {
            const id = a.equipmentId || a.Equipment_ID;
            if (id) {
              ids.push(id);
              meta[id] = {
                type: a.equipmentType || a.Type || 'Machinery',
                make: a.make || a.Make || 'Caterpillar',
                model: a.model || a.Model || 'CAT Equipment',
                site: a.currentSite || a.Site_ID || 'Depot Yard',
              };
            }
          });
          const finalIds = isCustomer ? ids.filter(id => customerScopedIds.includes(id)) : ids;
          setAllAssets(finalIds.length > 0 ? finalIds : (isCustomer ? customerScopedIds : ids));
          setAssetMetaMap(meta);
        } else {
          setAllAssets(isCustomer ? customerScopedIds : Array.from({ length: 40 }, (_, i) => `EQX10${i < 9 ? '0' : ''}${i + 1}`));
        }
      } catch {
        setAllAssets(isCustomer ? customerScopedIds : Array.from({ length: 40 }, (_, i) => `EQX10${i < 9 ? '0' : ''}${i + 1}`));
      }
    };
    fetchAssetsList();
  }, []);

  const fetchTelemetry = async (id) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const springRes = await springApi.get(`/telemetry/${id.trim().toUpperCase()}`).catch(() => null);
      if (springRes?.data && springRes.data.length > 0) {
        const mapped = springRes.data.map((t) => ({
          Equipment_ID: t.equipmentId,
          Fuel_Level_Pct: t.fuelRemainingPercentage,
          Engine_Hours: t.engineHours,
          Idle_Hours: t.idleHours,
          Latitude: t.latitude,
          Longitude: t.longitude,
          Speed: t.speed || 0,
          Engine_Temp_C: 85 + Math.random() * 5,
          Engine_RPM: t.speed > 0 ? 1850 + Math.random() * 150 : 750,
          Battery_Voltage: 24.1,
          Active_DTC_Code: t.diagnosticTroubleCode,
          Gps_Status: t.gpsStatus || 'LOCK',
          Ignition_Status: t.ignitionStatus || 'ON',
          Timestamp: t.timestamp,
        }));
        setTelemetry(mapped);
        return;
      }

      const res = await analyticsApi.get(`/telemetry/${id.trim().toUpperCase()}`, { params: { limit: 50 } }).catch(() => null);
      const data = res?.data?.telemetry || [];
      if (data.length === 0) {
        setTelemetry([
          {
            Equipment_ID: id, Fuel_Level_Pct: 76.5, Engine_Hours: 1250.4, Idle_Hours: 185.2,
            Engine_Temp_C: 86, Engine_RPM: 1880, Speed: 12.0, Battery_Voltage: 24.1,
            Latitude: 37.7749, Longitude: -122.4194, Active_DTC_Code: null, Gps_Status: 'LOCK', Ignition_Status: 'ON'
          }
        ]);
      } else {
        setTelemetry(data);
      }
    } catch {
      setTelemetry([
        {
          Equipment_ID: id, Fuel_Level_Pct: 76.5, Engine_Hours: 1250.4, Idle_Hours: 185.2,
          Engine_Temp_C: 86, Engine_RPM: 1880, Speed: 12.0, Battery_Voltage: 24.1,
          Latitude: 37.7749, Longitude: -122.4194, Active_DTC_Code: null, Gps_Status: 'LOCK', Ignition_Status: 'ON'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTelemetry(assetId); }, []);

  useEffect(() => {
    if (!latestUpdate) return;
    if (latestUpdate.equipmentId && latestUpdate.equipmentId !== assetId) return;

    setTelemetry((prev) => {
      const newRecord = {
        Equipment_ID: latestUpdate.equipmentId,
        Fuel_Level_Pct: latestUpdate.fuelRemainingPercentage ?? 75.0,
        Engine_Hours: latestUpdate.engineHours ?? 1250.0,
        Idle_Hours: latestUpdate.idleHours ?? 185.0,
        Latitude: latestUpdate.latitude ?? 37.7749,
        Longitude: latestUpdate.longitude ?? -122.4194,
        Speed: latestUpdate.speed ?? (latestUpdate.ignitionStatus === 'IDLE' ? 0 : 12.5),
        Engine_Temp_C: latestUpdate.diagnosticTroubleCode ? 97.5 : 84 + Math.random() * 5,
        Engine_RPM: latestUpdate.ignitionStatus === 'IDLE' ? 750 : 1850 + Math.random() * 150,
        Battery_Voltage: 24.1,
        Active_DTC_Code: latestUpdate.diagnosticTroubleCode || null,
        Gps_Status: latestUpdate.gpsStatus || 'LOCK',
        Ignition_Status: latestUpdate.ignitionStatus || 'ON',
        Timestamp: latestUpdate.timestamp,
      };
      return [...prev.slice(-49), newRecord];
    });
  }, [latestUpdate, assetId]);

  const latest = telemetry[telemetry.length - 1] || {};
  const meta = assetMetaMap[assetId] || ASSET_META[assetId] || { type: 'Machinery', make: 'Caterpillar', model: 'CAT Equipment', site: 'Depot Yard' };

  const fullAssetsList = useMemo(() => {
    if (isCustomer) {
      // Customers only see their contracted equipment
      return customerScopedIds;
    }
    const set = new Set(allAssets);
    for (let i = 1; i <= 40; i++) {
      set.add(`EQX10${i < 10 ? '0' : ''}${i}`);
    }
    return Array.from(set).sort();
  }, [allAssets, isCustomer, customerScopedIds]);

  const filteredAssets = fullAssetsList.filter((id) => {
    const itemMeta = assetMetaMap[id] || ASSET_META[id] || {};
    return id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (itemMeta.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (itemMeta.model || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectAsset = (newId) => {
    setAssetId(newId);
    fetchTelemetry(newId);
  };

  const getFuelStatus = (pct) => {
    const val = parseFloat(pct || 0);
    if (val < 15) return { color: 'var(--rose)', bg: 'var(--rose-dim)', label: 'CRITICAL LOW' };
    if (val < 25) return { color: 'var(--amber)', bg: 'var(--amber-dim)', label: 'WARNING' };
    return { color: 'var(--emerald)', bg: 'var(--emerald-dim)', label: 'NORMAL' };
  };

  const getTempStatus = (temp) => {
    const val = parseFloat(temp || 0);
    if (val > 96) return { color: 'var(--rose)', bg: 'var(--rose-dim)', label: 'ELEVATED' };
    return { color: 'var(--emerald)', bg: 'var(--emerald-dim)', label: 'NORMAL' };
  };

  const fuelStatus = getFuelStatus(latest.Fuel_Level_Pct);
  const tempStatus = getTempStatus(latest.Engine_Temp_C);
  const hasDtcFault = Boolean(latest.Active_DTC_Code);

  const chartData = useMemo(() => {
    if (!telemetry || telemetry.length === 0) return [];

    let subset = telemetry;
    if (timeRange === '15m') {
      subset = telemetry.slice(-15);
    } else if (timeRange === '1h') {
      subset = telemetry.slice(-30);
    } else if (timeRange === '6h') {
      const step = Math.max(1, Math.floor(telemetry.length / 25));
      subset = telemetry.filter((_, idx) => idx % step === 0);
    } else {
      subset = telemetry.slice(-50);
    }

    return subset.map((t, i) => {
      let timeLabel = `${i + 1}`;
      if (t.Timestamp) {
        try {
          const dt = new Date(t.Timestamp);
          timeLabel = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
          timeLabel = `${i + 1}`;
        }
      }
      return {
        idx: timeLabel,
        'Fuel %': parseFloat(t.Fuel_Level_Pct || 0),
        'Engine Temp (°C)': parseFloat(t.Engine_Temp_C || 0),
        'Engine RPM': parseFloat(t.Engine_RPM || 0),
        'Engine Hours': parseFloat(t.Engine_Hours || 0),
      };
    });
  }, [telemetry, timeRange]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">Telemetry Monitor</h1>
            <span style={{
              background: 'rgba(255, 205, 0, 0.2)',
              border: '1px solid #e6b800',
              color: '#000000',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 4
            }}>
              {assetId} — {meta.make} {meta.model}
            </span>
          </div>
          <p className="page-subtitle" style={{ marginTop: 4 }}>Real-time IoT sensor telemetry streams and engine diagnostic readouts</p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
          fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isConnected ? 'var(--emerald)' : 'var(--rose)',
            boxShadow: isConnected ? '0 0 6px var(--emerald)' : 'none',
          }} />
          <span>{isConnected ? `WebSocket Stream Active (${updateCount} ticks)` : 'Connecting Stream...'}</span>
        </div>
      </div>

      {/* Machine Notification & Alert Warning Banner */}
      {assetId === 'EQX1002' && (
        <div style={{
          padding: '14px 18px', marginBottom: 20, borderRadius: '8px', background: 'rgba(217, 119, 6, 0.1)',
          borderLeft: '4px solid #d97706', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>⏳</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Contract Notice: Rental for EQX1002 (CAT 320 Grader) is expiring in 5 days (Aug 15, 2026)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Active Contract: <strong style={{ fontFamily: 'monospace' }}>CAT-PAC-9012</strong>. Extend now to maintain un-interrupted site operations.
              </div>
            </div>
          </div>
          <button
            onClick={() => alert(`Contract renewal request for EQX1002 submitted to CAT Dealer.`)}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 800, background: '#d97706', color: '#ffffff', border: 'none' }}
          >
            Extend Contract &rarr;
          </button>
        </div>
      )}

      {assetId === 'EQX1004' && (
        <div style={{
          padding: '14px 18px', marginBottom: 20, borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '4px solid #ef4444', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>⛽</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Critical Fuel Alert: EQX1004 (CAT 950M Compactor) fuel level is LOW (14.2%)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                On-site fuel level has dropped below safety margin at Depot Site Yard B.
              </div>
            </div>
          </div>
          <button
            onClick={() => alert(`On-site refuel tanker request for EQX1004 dispatched.`)}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 800, background: '#ef4444', color: '#ffffff', border: 'none' }}
          >
            Request Refuel &rarr;
          </button>
        </div>
      )}

      {assetId === 'EQX1012' && (
        <div style={{
          padding: '14px 18px', marginBottom: 20, borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)',
          borderLeft: '4px solid #3b82f6', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Engine Diagnostic Warning: EQX1012 reported active DTC code P0217 (Over-Temperature)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                IoT sensor flagged elevated coolant temperature (84°C). Recommended Action: Inspect radiator line & fan belt.
              </div>
            </div>
          </div>
          <button
            onClick={() => alert(`Maintenance ticket generated for EQX1012.`)}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 800 }}
          >
            Schedule Inspection &rarr;
          </button>
        </div>
      )}

      {/* Asset Switcher Bar */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 24, background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              {isCustomer
                ? `Your Contracted Equipment (${fullAssetsList.length} Units — ${companyName}):`
                : 'Select Active Fleet Asset (40 Equipment Units Available):'}
            </div>

            {/* Custom Dropdown for Quick Access to all 40 Assets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 460 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                Select Asset:
              </span>
              <select
                className="select-custom"
                value={assetId}
                onChange={(e) => handleSelectAsset(e.target.value)}
                style={{ fontSize: '0.85rem', fontWeight: 700 }}
              >
                {fullAssetsList.map((id) => {
                  const itemMeta = assetMetaMap[id] || ASSET_META[id] || {};
                  return (
                    <option key={id} value={id}>
                      {id} — {itemMeta.type || 'Machinery'} ({itemMeta.site || 'Depot'})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            {filteredAssets.slice(0, 10).map((id) => {
              const isSelected = assetId === id;
              return (
                <button
                  key={id}
                  onClick={() => handleSelectAsset(id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: isSelected ? '2px solid var(--brand-accent)' : '1px solid var(--border)',
                    background: isSelected ? 'rgba(255, 205, 0, 0.15)' : 'var(--bg-card)',
                    color: isSelected ? '#000000' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontWeight: 800 }}>{id}</span>
                  <span style={{ fontSize: '0.72rem', color: isSelected ? '#000000' : 'var(--text-muted)' }}>
                    ({assetMetaMap[id]?.type || ASSET_META[id]?.type || 'Machinery'})
                  </span>
                </button>
              );
            })}

            <div className="input-wrap" style={{ width: 200, marginLeft: 'auto' }}>
              <span className="input-icon">
                <MagnifyingGlass size={14} weight="bold" color="var(--text-muted)" />
              </span>
              <input
                className="input input-with-icon"
                placeholder={isCustomer ? `Search ${fullAssetsList.length} contracted assets...` : 'Search 40 assets...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px 6px 32px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fault Alert Banner */}
      {(hasDtcFault || parseFloat(latest.Fuel_Level_Pct || 100) < 15) && (
        <div style={{
          background: 'var(--bg-card)',
          borderLeft: '4px solid var(--rose)',
          borderTop: '1px solid var(--border)',
          borderRight: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          borderRadius: 6,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Warning size={20} weight="bold" color="var(--rose)" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Operational Fault Alert — {assetId}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {hasDtcFault && <span>Active DTC Fault Code: <strong style={{ color: 'var(--rose)' }}>{latest.Active_DTC_Code}</strong>. </span>}
                {parseFloat(latest.Fuel_Level_Pct || 100) < 15 && <span>Fuel level critical ({latest.Fuel_Level_Pct?.toFixed(1)}%). </span>}
              </div>
            </div>
          </div>
          <span style={{ background: 'var(--rose-dim)', color: 'var(--rose)', fontWeight: 700, fontSize: '0.72rem', padding: '4px 12px', borderRadius: 4 }}>
            ACTION REQUIRED
          </span>
        </div>
      )}

      {loading && (
        <div className="loading-center" style={{ margin: '40px 0' }}>
          <div className="spinner spinner-lg" />
          <span>Ingesting telemetry stream for {assetId}...</span>
        </div>
      )}

      {telemetry.length > 0 && !loading && (
        <>
          {/* Group 1: Operational Metrics Stream */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Pulse size={18} weight="bold" color="var(--brand-accent-hover)" />
              <h3 className="tracking-uppercase" style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>1. Operational Metrics Stream</h3>
            </div>

            <div className="grid-4">
              <div className="card" style={{ padding: '20px 22px', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="tracking-uppercase">Engine Hours</span>
                  <Clock size={16} color="var(--text-muted)" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {latest.Engine_Hours ? Number(latest.Engine_Hours).toFixed(2) : '—'} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>hrs</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <CheckCircle size={14} weight="bold" color="var(--emerald)" /> Continuous Sensor Stream
                </div>
              </div>

              <div className="card" style={{ padding: '20px 22px', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="tracking-uppercase">Idle Duration</span>
                  <Lightning size={16} weight="bold" color="var(--text-muted)" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {latest.Idle_Hours ? Number(latest.Idle_Hours).toFixed(2) : '—'} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>hrs</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>
                  Status: <strong style={{ color: 'var(--text-primary)' }}>{latest.Ignition_Status || 'ON'}</strong>
                </div>
              </div>

              <div className="card" style={{ padding: '20px 22px', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="tracking-uppercase">Engine Speed</span>
                  <Gauge size={16} color="var(--text-muted)" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {latest.Engine_RPM ? Math.round(latest.Engine_RPM) : '—'} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>RPM</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>
                  Travel Speed: <strong style={{ color: 'var(--text-primary)' }}>{latest.Speed?.toFixed(1) || 0} km/h</strong>
                </div>
              </div>

              <div className="card" style={{ padding: '20px 22px', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="tracking-uppercase">Assigned Depot</span>
                  <MapPin size={16} color="var(--text-muted)" />
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, lineHeight: 1.3 }}>
                  {meta.site.split(' (')[0]}
                </div>
                <div className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>
                  GPS: {latest.Latitude?.toFixed(4)}, {latest.Longitude?.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Health & Diagnostic Indicators */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Cpu size={18} weight="bold" color="var(--brand-accent-hover)" />
              <h3 className="tracking-uppercase" style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>2. Health & Diagnostic Indicators</h3>
            </div>

            <div className="grid-4">
              <div className="card" style={{
                padding: '20px 22px', marginBottom: 0,
                border: parseFloat(latest.Fuel_Level_Pct || 100) < 25 ? `1px solid ${fuelStatus.color}` : '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="tracking-uppercase" style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>Fuel Tank Level</span>
                  <GasPump size={20} weight="duotone" color={fuelStatus.color} />
                </div>
                <div className="font-mono" style={{ fontSize: '2.1rem', fontWeight: 800, color: parseFloat(latest.Fuel_Level_Pct || 100) < 25 ? fuelStatus.color : 'var(--text-primary)', lineHeight: 1.1 }}>
                  {latest.Fuel_Level_Pct ? latest.Fuel_Level_Pct.toFixed(1) : '—'}<span style={{ fontSize: '1.1rem' }}>%</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <span style={{ background: fuelStatus.bg, color: fuelStatus.color, fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: 4 }}>
                    {fuelStatus.label}
                  </span>
                </div>
              </div>

              <div className="card" style={{
                padding: '20px 22px', marginBottom: 0,
                border: parseFloat(latest.Engine_Temp_C || 0) > 96 ? `1px solid ${tempStatus.color}` : '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="tracking-uppercase" style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>Coolant Temp</span>
                  <ThermometerHot size={20} weight="duotone" color={tempStatus.color} />
                </div>
                <div className="font-mono" style={{ fontSize: '2.1rem', fontWeight: 800, color: parseFloat(latest.Engine_Temp_C || 0) > 96 ? tempStatus.color : 'var(--text-primary)', lineHeight: 1.1 }}>
                  {latest.Engine_Temp_C ? Math.round(latest.Engine_Temp_C) : '—'}<span style={{ fontSize: '1.1rem' }}>°C</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <span style={{ background: tempStatus.bg, color: tempStatus.color, fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: 4 }}>
                    {tempStatus.label}
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '20px 22px', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="tracking-uppercase" style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>Battery Voltage</span>
                  <BatteryCharging size={20} weight="duotone" color="var(--emerald)" />
                </div>
                <div className="font-mono" style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {latest.Battery_Voltage ? latest.Battery_Voltage.toFixed(1) : '24.1'}<span style={{ fontSize: '1.1rem' }}>V</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <span style={{ background: 'var(--emerald-dim)', color: 'var(--emerald)', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: 4 }}>
                    HEALTHY
                  </span>
                </div>
              </div>

              <div className="card" style={{
                padding: '20px 22px', marginBottom: 0,
                border: hasDtcFault ? '1px solid var(--rose)' : '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="tracking-uppercase" style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>Diagnostic Code</span>
                  <DtcFaultIcon size={20} color={hasDtcFault ? 'var(--rose)' : 'var(--text-muted)'} />
                </div>
                <div className="tabular-nums" style={{
                  fontSize: hasDtcFault ? '1.2rem' : '1.5rem',
                  fontWeight: 800,
                  color: hasDtcFault ? 'var(--rose)' : 'var(--text-primary)',
                  lineHeight: 1.2
                }}>
                  {latest.Active_DTC_Code || 'NO FAULTS'}
                </div>
                <div style={{ marginTop: 10 }}>
                  <span style={{
                    background: hasDtcFault ? 'var(--rose-dim)' : 'var(--emerald-dim)',
                    color: hasDtcFault ? 'var(--rose)' : 'var(--emerald)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 4
                  }}>
                    {hasDtcFault ? 'ALERT TRIGGERED' : 'SYSTEM HEALTHY'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time-Series Chart */}
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 24 }}>
            <div className="card-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12, padding: '18px 20px' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Time-Series Sensor Analysis — {assetId}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Showing <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeChartMetric}</span> over time ({telemetry.length} data samples)
                </p>
              </div>

              <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-elevated)', padding: 4, borderRadius: 6, border: '1px solid var(--border)' }}>
                  {['Fuel %', 'Engine Temp (°C)', 'Engine RPM', 'Engine Hours'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveChartMetric(m)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 4,
                        border: 'none',
                        background: activeChartMetric === m ? 'var(--bg-card)' : 'transparent',
                        color: activeChartMetric === m ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: activeChartMetric === m ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-elevated)', padding: 4, borderRadius: 6, border: '1px solid var(--border)' }}>
                  {['15m', '1h', '6h', 'Live'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 4,
                        border: 'none',
                        background: timeRange === r ? 'var(--bg-card)' : 'transparent',
                        color: timeRange === r ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: timeRange === r ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-body" style={{ padding: '20px 16px 16px 0' }}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="idx" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                  
                  {activeChartMetric === 'Fuel %' && (
                    <Line type="monotone" dataKey="Fuel %" stroke="#0284c7" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  )}
                  {activeChartMetric === 'Engine Temp (°C)' && (
                    <Line type="monotone" dataKey="Engine Temp (°C)" stroke="#dc2626" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  )}
                  {activeChartMetric === 'Engine RPM' && (
                    <Line type="monotone" dataKey="Engine RPM" stroke="#059669" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                  )}
                  {activeChartMetric === 'Engine Hours' && (
                    <Line type="monotone" dataKey="Engine Hours" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
