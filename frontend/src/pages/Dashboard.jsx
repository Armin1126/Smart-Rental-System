import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { MetricCard } from '../components/MetricCard';
import { MOCK_ASSETS, MOCK_ALERTS, MOCK_RECOMMENDATIONS } from '../constants/mockData';
import { AssetTable } from '../components/AssetTable';
import { AlertCard } from '../components/AlertCard';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Caterpillar Operations Dashboard</h1>
        <p className="text-slate-400 text-sm">Post-checkout asset monitoring, telemetry tracking & fleet metrics.</p>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Active Rented Fleet" value="142" subtitle="89% utilization rate" trend="↑ 12% vs last week" color="text-amber-400" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Telemetry Streamers" value="138" subtitle="Active IoT beacons" trend="Online" color="text-cyan-400" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Active Alerts" value={MOCK_ALERTS.length} subtitle="Maintenance & Geofence" color="text-rose-400" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="AI Recommendations" value={MOCK_RECOMMENDATIONS.length} subtitle="Reallocation & Pricing" color="text-emerald-400" />
        </Grid>
      </Grid>

      <Box className="space-y-4">
        <Typography variant="h6" className="font-semibold text-slate-200">Rented Asset Fleet Overview</Typography>
        <AssetTable assets={MOCK_ASSETS} />
      </Box>

      <Box className="space-y-4">
        <Typography variant="h6" className="font-semibold text-slate-200">Critical Fleet Alerts</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_ALERTS.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </Box>
    </div>
  );
};
