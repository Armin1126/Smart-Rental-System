import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { analyticsApi } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const triggerSyntheticGen = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.post('/generate-synthetic-data?records=50');
      setResult(res.data);
    } catch (err: any) {
      setResult({ status: 'Error', message: 'Analytics server not connected yet (FastAPI backend must be running on port 8000).' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Predictive Analytics & Data Science</h1>
        <p className="text-slate-400 text-sm">FastAPI + Pandas + Scikit-Learn data generation and maintenance risk modeling.</p>
      </div>

      <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
        <CardContent className="space-y-4">
          <Typography variant="h6" className="font-semibold text-cyan-400 flex items-center gap-2">
            <AutoAwesomeIcon /> Synthetic Telemetry Generator
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Trigger Python Faker and NumPy pipelines to produce simulated IoT engine vibration, operating temperature, and battery charge cycles.
          </Typography>
          <Button
            variant="contained"
            onClick={triggerSyntheticGen}
            disabled={loading}
            sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Run Synthetic Data Pipeline'}
          </Button>

          {result && (
            <pre className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto border border-slate-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
