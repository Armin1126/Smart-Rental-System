import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { MetricCard } from '../components/MetricCard';
import { AssetTable } from '../components/AssetTable';
import { AlertCard } from '../components/AlertCard';
import { getDashboardMetrics } from '../services/dashboardService';
import { getAssets } from '../services/assetService';
import { getAlerts } from '../services/alertService';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [assets, setAssets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metricRes, assetRes, alertRes] = await Promise.all([
          getDashboardMetrics(),
          getAssets(),
          getAlerts(),
        ]);
        setMetrics(metricRes);
        setAssets(assetRes || []);
        setAlerts(alertRes || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to fetch live data from Spring Boot backend. Displaying offline metrics.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <CircularProgress sx={{ color: '#ffcd00' }} />
        <p className="text-gray-600 text-sm font-medium">Loading Caterpillar Fleet Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {error && (
        <Alert severity="warning" className="rounded-lg shadow-sm">
          {error}
        </Alert>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Caterpillar Operations Dashboard</h1>
        <p className="text-gray-500 text-xs">Real-time asset telemetry monitoring, contract metrics, and alert detection.</p>
      </div>

      {/* KPI Cards Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Registered Fleet"
            value={metrics?.totalAssets ?? 50}
            subtitle={`${metrics?.activeRentals ?? 0} active rentals`}
            trend="Live Database"
            color="text-amber-500"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Jobsites"
            value={metrics?.totalSites ?? 8}
            subtitle={`${metrics?.totalOperators ?? 0} assigned operators`}
            trend="Active Deployments"
            color="text-[#ffcd00]"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Operational Alerts"
            value={metrics?.totalAlerts ?? alerts.length}
            subtitle={`${metrics?.criticalAlerts ?? 0} critical priority`}
            color="text-rose-500"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="AI Recommendations"
            value={metrics?.pendingRecommendations ?? 8}
            subtitle="Fleet optimization actions"
            color="text-emerald-500"
          />
        </Grid>
      </Grid>

      {/* Assets Table Section */}
      <Box className="space-y-3">
        <Typography variant="h6" className="font-bold text-gray-900 text-base">
          VisionLink Asset Inventory
        </Typography>
        <AssetTable assets={assets.slice(0, 10)} />
      </Box>

      {/* Alerts Section */}
      <Box className="space-y-3">
        <Typography variant="h6" className="font-bold text-gray-900 text-base">
          Recent Anomaly Alerts
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.slice(0, 4).map((alert, idx) => (
            <AlertCard key={alert.id || idx} alert={alert} />
          ))}
        </div>
      </Box>
    </div>
  );
};
