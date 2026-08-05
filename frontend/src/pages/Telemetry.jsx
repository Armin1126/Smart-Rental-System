import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { SparkBar } from '../components/SparkBar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.75rem' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>#{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>)}
    </div>
  );
};

const TelemetryCard = ({ label, value, unit, icon, color = 'var(--amber)' }) => (
  <div className="kpi-card fade-in">
    <div className="flex items-center justify-between">
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{unit}</span>
    </div>
    <div>
      <div className="kpi-value" style={{ fontSize: '1.6rem', color }}>{value ?? '—'}</div>
      <div className="kpi-label mt-1">{label}</div>
    </div>
  </div>
);

export const Telemetry = () => {
  const [assetId, setAssetId] = useState('EQX1001');
  const [inputId, setInputId] = useState('EQX1001');
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTelemetry = async (id) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setTelemetry([]);
    try {
      const res = await analyticsApi.get(`/telemetry/${id.trim().toUpperCase()}`, { params: { limit: 50 } });
      const data = res.data.telemetry || [];
      if (data.length === 0) setError(`No telemetry records found for asset ${id.toUpperCase()}.`);
      setTelemetry(data);
    } catch {
      setError('Failed to fetch telemetry. Is FastAPI running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTelemetry(assetId); }, []);

  const handleSearch = () => { setAssetId(inputId); fetchTelemetry(inputId); };

  const latest = telemetry[telemetry.length - 1] || {};

  const chartData = telemetry.map((t, i) => ({
    idx: i + 1,
    'Fuel %':  parseFloat(t.Fuel_Level_Pct || 0),
    'Eng Temp': parseFloat(t.Engine_Temp_C || 0),
    'RPM':      parseFloat(t.Engine_RPM || 0) / 10,
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Telemetry Monitor</h1>
          <p className="page-subtitle">Live IoT sensor data for individual assets</p>
        </div>
      </div>

      {/* Asset Search */}
      <div className="card mb-5">
        <div className="card-body">
          <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
            <div className="input-wrap" style={{ flex: '1 1 280px' }}>
              <span className="input-icon">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
              <input
                className="input input-with-icon"
                placeholder="Enter Asset ID (e.g. EQX1001)"
                value={inputId}
                onChange={e => setInputId(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? 'Loading…' : '📡 Load Telemetry'}
            </button>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {['EQX1001','EQX1002','EQX1003','EQX1004','EQX1010'].map(id => (
                <button key={id} className={`btn btn-sm ${assetId === id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setInputId(id); setAssetId(id); fetchTelemetry(id); }}>
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-warn">⚠️ {error}</div>}

      {loading && <div className="loading-center"><div className="spinner spinner-lg" /><span>Fetching telemetry…</span></div>}

      {telemetry.length > 0 && (
        <>
          {/* Latest Reading Cards */}
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Latest Reading — {assetId} ({telemetry.length} records)
          </h3>
          <div className="grid-4 mb-5">
            <TelemetryCard icon="⚙️" label="Engine Hours" value={Number(latest.Engine_Hours || 0).toLocaleString()} unit="Hours" color="var(--amber)" />
            <TelemetryCard icon="⛽" label="Fuel Level" value={`${parseFloat(latest.Fuel_Level_Pct || 0).toFixed(1)}%`} unit="Remaining"
              color={parseFloat(latest.Fuel_Level_Pct) < 20 ? 'var(--rose)' : parseFloat(latest.Fuel_Level_Pct) < 50 ? 'var(--orange)' : 'var(--emerald)'} />
            <TelemetryCard icon="🌡️" label="Engine Temp" value={`${parseFloat(latest.Engine_Temp_C || 0).toFixed(0)}°C`} unit="Celsius"
              color={parseFloat(latest.Engine_Temp_C) > 100 ? 'var(--rose)' : 'var(--sky)'} />
            <TelemetryCard icon="💨" label="Engine RPM" value={Number(latest.Engine_RPM || 0).toLocaleString()} unit="RPM" color="var(--violet)" />
          </div>
          <div className="grid-4 mb-5">
            <TelemetryCard icon="📳" label="Vibration" value={`${parseFloat(latest.Vibration_Level || 0).toFixed(2)}`} unit="g" color="var(--orange)" />
            <TelemetryCard icon="🔋" label="Battery" value={`${parseFloat(latest.Battery_Voltage || 0).toFixed(1)}V`} unit="Volts" color="var(--emerald)" />
            <TelemetryCard icon="⚡" label="Hydraulic Psi" value={Number(latest.Hydraulic_Pressure_PSI || 0).toFixed(0)} unit="PSI" color="var(--amber)" />
            <TelemetryCard icon="🚨" label="DTC Code" value={latest.Active_DTC_Code || 'None'} unit="Diagnostic" color={latest.Active_DTC_Code ? 'var(--rose)' : 'var(--emerald)'} />
          </div>

          {/* Chart */}
          <div className="card">
            <div className="card-header">
              <h3>Telemetry History — {assetId}</h3>
              <span className="text-xs text-muted">{telemetry.length} readings</span>
            </div>
            <div className="card-body" style={{ padding: '16px 8px' }}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="idx" label={{ value: 'Reading #', position: 'insideBottom', fill: '#64748b', fontSize: 11 }} />
                  <YAxis />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.75rem' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Reading #{label}</p>
                        {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value.toFixed(1)}</p>)}
                      </div>
                    );
                  }} />
                  <Line type="monotone" dataKey="Fuel %" stroke="#ffcd00" strokeWidth={2} dot={false} name="Fuel %" />
                  <Line type="monotone" dataKey="Eng Temp" stroke="#f43f5e" strokeWidth={2} dot={false} name="Eng Temp (÷1)" />
                  <Line type="monotone" dataKey="RPM" stroke="#38bdf8" strokeWidth={2} dot={false} name="RPM (÷10)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
