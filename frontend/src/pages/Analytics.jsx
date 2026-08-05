import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import BarChartIcon from '@mui/icons-material/BarChart';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecommendIcon from '@mui/icons-material/Recommend';
import CircularProgress from '@mui/material/CircularProgress';

const PIPELINE_STAGES = [
  { key: 'generate', icon: <StorageIcon fontSize="small" />, label: 'Synthetic Dataset Generation', desc: 'assets.csv · sites.csv · operators.csv · rental_records.csv · telemetry.csv' },
  { key: 'preprocess', icon: <RefreshIcon fontSize="small" />, label: 'Data Preprocessing & Enrichment', desc: 'processed_dataset.csv · Extended Contracts · Long-Term Rentals' },
  { key: 'dashboard', icon: <BarChartIcon fontSize="small" />, label: 'Dashboard Analytics Engine', desc: 'dashboard_analytics.json · Fleet KPIs · Site Breakdowns · Equipment Types' },
  { key: 'underutil', icon: <TroubleshootIcon fontSize="small" />, label: 'Under-Utilization Analyzer', desc: 'underutilized_assets.json · Return Early / Reallocate / Monitor flags' },
  { key: 'anomaly', icon: <ErrorIcon fontSize="small" />, label: 'Rule-Based Anomaly Detector', desc: 'anomalies.json · High Fuel Consumption · Engine Overtemp · Overdue Alerts' },
  { key: 'forecast', icon: <TrendingUpIcon fontSize="small" />, label: 'Demand Forecasting Model', desc: 'forecast.json · 3-Month Moving Average · Confidence Scoring' },
  { key: 'recommendations', icon: <RecommendIcon fontSize="small" />, label: 'AI Recommendation Engine', desc: 'recommendations.json · Move Asset · Return Early · Refuel · Maintenance' },
];

const StageRow = ({ stage, status }) => {
  const isComplete = status === 'done';
  const isRunning = status === 'running';
  const isError = status === 'error';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
      isComplete ? 'bg-emerald-50 border-emerald-200' :
      isRunning ? 'bg-amber-50 border-amber-300' :
      isError ? 'bg-red-50 border-red-200' :
      'bg-white border-gray-200'
    }`}>
      <div className={`mt-0.5 flex-shrink-0 ${
        isComplete ? 'text-emerald-600' :
        isRunning ? 'text-amber-500' :
        isError ? 'text-red-500' :
        'text-gray-300'
      }`}>
        {isRunning
          ? <CircularProgress size={16} sx={{ color: '#f59e0b' }} />
          : isComplete
            ? <CheckCircleIcon fontSize="small" />
            : isError
              ? <ErrorIcon fontSize="small" />
              : <span className="w-4 h-4 rounded-full border-2 border-gray-200 inline-block" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold ${
          isComplete ? 'text-emerald-800' : isRunning ? 'text-amber-800' : isError ? 'text-red-800' : 'text-gray-500'
        }`}>
          {stage.label}
        </div>
        <div className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">{stage.desc}</div>
      </div>
      <div className={`text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${
        isComplete ? 'text-emerald-600' : isRunning ? 'text-amber-600' : isError ? 'text-red-600' : 'text-gray-300'
      }`}>
        {isComplete ? 'Done' : isRunning ? 'Running…' : isError ? 'Failed' : 'Pending'}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, unit }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-1 shadow-xs">
    <div className="text-[11px] text-gray-500 font-medium">{label}</div>
    <div className="text-xl font-extrabold text-gray-900 font-mono tracking-tight">{value}</div>
    {unit && <div className="text-[10px] text-gray-400">{unit}</div>}
  </div>
);

export const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stageStatuses, setStageStatuses] = useState({});
  const [dashboardData, setDashboardData] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [apiStatus, setApiStatus] = useState(null);

  // Check if FastAPI is live on mount
  useEffect(() => {
    analyticsApi.get('/')
      .then(res => setApiStatus({ online: true, data: res.data }))
      .catch(() => setApiStatus({ online: false }));
  }, []);

  // Fetch dashboard stats after pipeline completes
  const fetchDashboardStats = async () => {
    try {
      const res = await analyticsApi.get('/dashboard');
      setDashboardData(res.data);
    } catch {}
  };

  useEffect(() => {
    if (result?.status === 'SUCCESS') {
      fetchDashboardStats();
    }
  }, [result]);

  const triggerPipeline = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDashboardData(null);
    setElapsed(0);

    // Animate stages sequentially
    const stages = PIPELINE_STAGES.map(s => s.key);
    const animateStages = async () => {
      const stageDelay = 600;
      const statuses = {};
      for (let i = 0; i < stages.length; i++) {
        statuses[stages[i]] = 'running';
        setStageStatuses({ ...statuses });
        await new Promise(r => setTimeout(r, stageDelay));
      }
    };

    const startTime = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 200);

    try {
      const [pipelineRes] = await Promise.all([
        analyticsApi.post('/generate?records=50'),
        animateStages(),
      ]);

      const finalStatuses = {};
      stages.forEach(k => finalStatuses[k] = 'done');
      setStageStatuses(finalStatuses);
      setResult(pipelineRes.data);
    } catch (err) {
      const finalStatuses = {};
      stages.forEach(k => finalStatuses[k] = 'error');
      setStageStatuses(finalStatuses);
      setError(err?.response?.data?.detail || 'FastAPI analytics engine offline or encountered an error.');
    } finally {
      clearInterval(timer);
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      setLoading(false);
    }
  };

  const summary = dashboardData?.summary;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">FastAPI Analytics Engine</h1>
        <p className="text-gray-500 text-sm mt-0.5">Run the full AI pipeline: synthetic telemetry generation → preprocessing → anomaly detection → forecasting → recommendations.</p>
      </div>

      {/* API Status Banner */}
      {apiStatus && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${
          apiStatus.online
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${apiStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {apiStatus.online
            ? `FastAPI Analytics Engine ONLINE — v${apiStatus.data?.version || '1.2.0'} · http://localhost:8000`
            : 'FastAPI Analytics Engine OFFLINE — start with: uvicorn api:app --port 8000'
          }
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pipeline Control Panel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-neutral-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white text-sm font-bold">
              <AutoAwesomeIcon fontSize="small" className="text-[#ffcd00]" />
              <span>Analytics Pipeline Control</span>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
                <CircularProgress size={12} sx={{ color: '#ffcd00' }} />
                <span>{elapsed}s elapsed</span>
              </div>
            )}
            {result?.status === 'SUCCESS' && !loading && (
              <span className="text-emerald-400 text-xs font-bold">✓ Completed in {elapsed}s</span>
            )}
          </div>

          <div className="p-4 space-y-3">
            {/* Trigger Button */}
            <button
              onClick={triggerPipeline}
              disabled={loading || !apiStatus?.online}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${
                loading || !apiStatus?.online
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#ffcd00] text-black hover:bg-amber-400 hover:shadow-md active:scale-95'
              }`}
            >
              {loading
                ? <><CircularProgress size={16} sx={{ color: '#666' }} /> Running Pipeline...</>
                : <><AutoAwesomeIcon fontSize="small" /> Generate Synthetic Telemetry Data</>
              }
            </button>

            {/* Pipeline Stages */}
            <div className="space-y-1.5">
              {PIPELINE_STAGES.map(stage => (
                <StageRow key={stage.key} stage={stage} status={stageStatuses[stage.key] || 'pending'} />
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs font-mono">
              <div className="font-bold text-sm mb-1 flex items-center gap-1"><ErrorIcon fontSize="small" /> Pipeline Error</div>
              {error}
            </div>
          )}

          {/* Success Summary Metrics */}
          {summary && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-neutral-900 px-4 py-2 text-white text-xs font-bold flex items-center gap-2">
                <BarChartIcon fontSize="small" className="text-[#ffcd00]" /> Live Pipeline Output Metrics
              </div>
              <div className="p-4 grid grid-cols-2 gap-2.5">
                <SummaryCard label="Total Records" value={summary.total_records?.toLocaleString()} unit="processed dataset rows" />
                <SummaryCard label="Avg Utilization" value={`${summary.average_utilization_pct}%`} unit="fleet-wide average" />
                <SummaryCard label="Total Engine Hours" value={summary.total_engine_hours?.toLocaleString()} unit="cumulative hours" />
                <SummaryCard label="Fuel Remaining" value={`${summary.fuel_remaining_average_pct}%`} unit="average across fleet" />
                <SummaryCard label="Overdue Assets" value={summary.overdue_assets} unit="require return action" />
                <SummaryCard label="Idle Assets" value={summary.idle_assets} unit="flagged for review" />
              </div>
            </div>
          )}

          {/* Artifacts Updated */}
          {result?.artifacts_updated && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-emerald-700 px-4 py-2 text-white text-xs font-bold flex items-center gap-2">
                <CheckCircleIcon fontSize="small" /> Artifacts Updated ({result.artifacts_updated.length} files)
              </div>
              <div className="p-3 grid grid-cols-1 gap-1">
                {result.artifacts_updated.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-700 font-mono px-2 py-1 bg-gray-50 rounded border border-gray-100">
                    <CheckCircleIcon fontSize="inherit" className="text-emerald-500" />
                    datasets/{f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder before pipeline run */}
          {!result && !error && !loading && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
              <AutoAwesomeIcon fontSize="large" className="text-gray-300 mb-2" />
              <p className="text-sm font-medium">Click "Generate Synthetic Telemetry Data" to run the full AI pipeline</p>
              <p className="text-xs mt-1">Generates 104+ records, runs anomaly detection, forecasting, and recommendations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
