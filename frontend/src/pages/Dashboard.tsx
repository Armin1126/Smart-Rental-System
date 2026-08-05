import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const mockTelemetry = [
  { time: '08:00', utilization: 65, maintenanceRisk: 12 },
  { time: '10:00', utilization: 78, maintenanceRisk: 15 },
  { time: '12:00', utilization: 92, maintenanceRisk: 24 },
  { time: '14:00', utilization: 85, maintenanceRisk: 18 },
  { time: '16:00', utilization: 88, maintenanceRisk: 29 },
  { time: '18:00', utilization: 70, maintenanceRisk: 20 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Asset Tracking Dashboard</h1>
        <p className="text-slate-400 text-sm">Real-time rental fleet monitoring & IoT telemetry metrics.</p>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
            <CardContent>
              <Typography color="text.secondary" sx={{ color: '#94a3b8' }} gutterBottom>Total Active Assets</Typography>
              <Typography variant="h4" className="font-bold text-cyan-400">142</Typography>
              <Typography variant="body2" sx={{ color: '#22c55e' }} className="mt-2">↑ 8% from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
            <CardContent>
              <Typography color="text.secondary" sx={{ color: '#94a3b8' }} gutterBottom>Ongoing Rentals</Typography>
              <Typography variant="h4" className="font-bold text-blue-400">98</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }} className="mt-2">89% fleet utilization</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
            <CardContent>
              <Typography color="text.secondary" sx={{ color: '#94a3b8' }} gutterBottom>Pending Maintenance</Typography>
              <Typography variant="h4" className="font-bold text-amber-400">5</Typography>
              <Typography variant="body2" sx={{ color: '#eab308' }} className="mt-2">Scheduled flags</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
            <CardContent>
              <Typography color="text.secondary" sx={{ color: '#94a3b8' }} gutterBottom>Revenue (MTD)</Typography>
              <Typography variant="h4" className="font-bold text-emerald-400">$48,250</Typography>
              <Typography variant="body2" sx={{ color: '#22c55e' }} className="mt-2">↑ 14% vs target</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-xl">
        <Typography variant="h6" className="font-semibold text-slate-200 mb-4">
          Fleet Utilization & Telemetry Risk Metrics
        </Typography>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTelemetry} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
              <Area type="monotone" dataKey="utilization" stroke="#06b6d4" fillOpacity={1} fill="url(#colorUtil)" name="Utilization %" />
              <Area type="monotone" dataKey="maintenanceRisk" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRisk)" name="Risk Score %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Box>
    </div>
  );
};
