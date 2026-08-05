import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { analyticsApi } from '../services/api';

export const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const triggerGeneration = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.post('/generate?records=50');
      setResult(res.data);
    } catch (err) {
      setResult({ status: 'Simulated', message: 'FastAPI analytics engine offline. Running mock data generator.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">FastAPI & Data Science Analytics</h1>
        <p className="text-slate-400 text-sm">Synthetic telemetry generator, demand forecaster, and anomaly detector.</p>
      </div>

      <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
        <CardContent className="space-y-4">
          <Typography variant="h6" className="font-semibold text-amber-400 flex items-center gap-2">
            <AutoAwesomeIcon /> Trigger Data Pipeline
          </Typography>
          <Button variant="contained" onClick={triggerGeneration} disabled={loading} sx={{ backgroundColor: '#ffcd00', color: '#111', fontWeight: 'bold' }}>
            {loading ? <CircularProgress size={24} /> : 'Generate Synthetic Telemetry Data'}
          </Button>

          {result && (
            <pre className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-amber-300 overflow-x-auto border border-slate-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
