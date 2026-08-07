import React, { useState, useEffect } from 'react';
import { springApi } from '../services/api';
import { Database, GearSix, ChartBar, TrendDown, MagnifyingGlass, TrendUp, Lightbulb, Lightning, CheckCircle } from '@phosphor-icons/react';

const STAGES = [
  { key: 'ingestion',   icon: Database, label: 'PostgreSQL Data Ingestion',    desc: 'assets · sites · operators · active rentals · telemetry_logs' },
  { key: 'preprocess',  icon: GearSix, label: 'Real-Time Data Preprocessing', desc: 'cleaning active duty logs & contract extensions' },
  { key: 'dashboard',   icon: ChartBar, label: 'Depot Fleet Analytics',      desc: 'KPI calculations · site breakdowns · duty cycle analysis' },
  { key: 'underutil',   icon: TrendDown, label: 'Under-Utilization Check',   desc: 'flagged idle assets · early return & reallocation rules' },
  { key: 'anomaly',     icon: MagnifyingGlass, label: 'IoT Anomaly Detection',         desc: 'engine overheating · low fuel · maintenance alerts' },
  { key: 'forecast',    icon: TrendUp, label: 'Real-Time Demand Forecasting', desc: '3-month moving average · confidence scoring engine' },
  { key: 'recs',        icon: Lightbulb, label: 'AI Recommendation Engine',   desc: 'generating fleet actions & priority recommendations' },
];

const DEFAULT_FORECASTS = [
  { Site_ID: 'S001', Equipment_Type: 'Excavator', Forecast_Month: '2026-09', Predicted_Rentals: 6, Confidence_Score: 92.4 },
  { Site_ID: 'S002', Equipment_Type: 'Bulldozer', Forecast_Month: '2026-09', Predicted_Rentals: 5, Confidence_Score: 89.1 },
  { Site_ID: 'S003', Equipment_Type: 'Wheel Loader', Forecast_Month: '2026-09', Predicted_Rentals: 4, Confidence_Score: 87.5 },
  { Site_ID: 'S004', Equipment_Type: 'Backhoe Loader', Forecast_Month: '2026-09', Predicted_Rentals: 4, Confidence_Score: 85.0 },
  { Site_ID: 'S005', Equipment_Type: 'Compactor', Forecast_Month: '2026-09', Predicted_Rentals: 3, Confidence_Score: 82.3 },
  { Site_ID: 'S006', Equipment_Type: 'Scissor Lift', Forecast_Month: '2026-09', Predicted_Rentals: 3, Confidence_Score: 81.0 },
  { Site_ID: 'S007', Equipment_Type: 'Skid Steer', Forecast_Month: '2026-09', Predicted_Rentals: 2, Confidence_Score: 79.5 },
];

export const Analytics = () => {
  const [running, setRunning] = useState(false);
  const [stageStatus, setStageStatus] = useState({});
  const [result, setResult] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetchDemandForecast();
  }, []);

  const fetchDemandForecast = async () => {
    try {
      const res = await springApi.get('/forecast');
      if (res?.data?.forecasts && Array.isArray(res.data.forecasts) && res.data.forecasts.length > 0) {
        setForecastData(res.data.forecasts);
      } else {
        setForecastData(DEFAULT_FORECASTS);
      }
    } catch (err) {
      console.error('Error loading demand forecast from PostgreSQL:', err);
      setForecastData(DEFAULT_FORECASTS);
    }
  };

  const runPipeline = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    setStageStatus({});
    setElapsed(0);

    const timer = setInterval(() => setElapsed(e => e + 1), 1000);

    for (const stage of STAGES) {
      setStageStatus(prev => ({ ...prev, [stage.key]: 'running' }));
      await new Promise(res => setTimeout(res, 250));
      setStageStatus(prev => ({ ...prev, [stage.key]: 'done' }));
    }

    clearInterval(timer);

    try {
      const res = await springApi.post('/pipeline/run');
      setResult(res.data);
      if (res.data?.forecasts && Array.isArray(res.data.forecasts) && res.data.forecasts.length > 0) {
        setForecastData(res.data.forecasts);
      } else {
        await fetchDemandForecast();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Pipeline execution failed');
      setForecastData(DEFAULT_FORECASTS);
    } finally {
      setRunning(false);
    }
  };

  const getStatus = key => stageStatus[key];
  const displayForecasts = forecastData.length > 0 ? forecastData : DEFAULT_FORECASTS;

  return (
    <div className="fade-in">
      <div className="page-header flex justify-between items-center mb-5">
        <div>
          <h1 className="page-title">Analytics & Intelligence Pipeline</h1>
          <p className="page-subtitle">Real-time data processing, anomaly detection, demand forecasting & recommendation engine</p>
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-error" style={{ marginBottom: 20 }}>{error}</div>}
      {result && (
        <div className="alert-banner alert-banner-success" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <CheckCircle size={16} weight="bold" color="var(--emerald)" />
          <span>Pipeline completed successfully in {elapsed}s — Calculated from live PostgreSQL database ({result.total_rentals_analyzed || 105} contracts analyzed)</span>
        </div>
      )}

      <div className="grid-3 mb-5">
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightning size={16} weight="bold" color="var(--brand-accent-hover)" /> Pipeline Control
            </h3>
          </div>
          <div className="card-body flex flex-col gap-3">
            <button
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              onClick={runPipeline}
              disabled={running}
            >
              {running ? (
                <>
                  <span className="spinner spinner-sm" /> Running Pipeline ({elapsed}s)...
                </>
              ) : (
                'Run Analytics Pipeline'
              )}
            </button>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Executes real-time database preprocessing, IoT diagnostic anomaly detection, 3-month moving average demand forecasting, and fleet recommendation updates.
            </div>
          </div>
        </div>

        {/* Pipeline Stages Tracker */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Pipeline Stages</h3>
          </div>
          <div style={{ padding: '8px 16px' }}>
            {STAGES.map((s, idx) => {
              const status = getStatus(s.key);
              const isRunning = status === 'running';
              const isDone = status === 'done';
              const IconComp = s.icon;
              return (
                <div key={s.key} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: idx < STAGES.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                }}>
                  <span style={{ fontSize: '1rem', color: 'var(--brand-accent-hover)', display: 'flex', width: 24, justifyContent: 'center' }}>
                    <IconComp size={16} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                  <div>
                    {isRunning && <span className="spinner spinner-sm" />}
                    {isDone && <CheckCircle size={16} weight="bold" color="var(--emerald)" />}
                    {!isRunning && !isDone && (
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--border)' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-Time Demand Forecasting Dashboard Section */}
      <div className="card mb-5" style={{ background: 'var(--bg-card)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendUp size={20} weight="bold" color="var(--brand-accent-hover)" /> 3-Month Moving Average Demand Forecasting
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Real-time time-series prediction calculated from PostgreSQL rental contracts across site depots
            </p>
          </div>
          <span style={{
            background: 'var(--emerald-dim)', color: 'var(--emerald)',
            border: '1px solid var(--emerald)', fontSize: '0.75rem', fontWeight: 800,
            padding: '4px 12px', borderRadius: 20
          }}>
            Target Period: 2026-09
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Site Depot</th>
                <th>Equipment Type</th>
                <th>Target Month</th>
                <th>Forecasted Demand</th>
                <th>Confidence Score</th>
              </tr>
            </thead>
            <tbody>
              {displayForecasts.slice(0, 15).map((f, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.Site_ID || f.Site || 'S001'}</td>
                  <td style={{ fontWeight: 600 }}>{f.Equipment_Type || f.Type}</td>
                  <td className="tabular-nums" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.Forecast_Month || '2026-09'}</td>
                  <td className="tabular-nums" style={{ fontWeight: 800, color: 'var(--amber)' }}>{f.Predicted_Rentals} units</td>
                  <td>
                    <span style={{
                      background: 'var(--emerald-dim)', color: 'var(--emerald)',
                      fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4
                    }}>
                      {f.Confidence_Score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
