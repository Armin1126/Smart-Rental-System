import React, { useState, useEffect } from 'react';
import { CircularProgress, Alert as MuiAlert } from '@mui/material';
import { AlertCard } from '../components/AlertCard';
import { getAlerts } from '../services/alertService';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAlerts();
        setAlerts(data || []);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Unable to load alerts from Spring Boot backend. Displaying cached alerts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <CircularProgress sx={{ color: '#ffcd00' }} />
        <p className="text-gray-500 text-xs font-medium">Fetching Anomaly Alerts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {error && (
        <MuiAlert severity="warning" className="rounded-lg shadow-2xs">
          {error}
        </MuiAlert>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts & Operational Anomalies</h1>
        <p className="text-gray-500 text-xs">Rule-based anomaly flags, diagnostic trouble codes, geofence breaches & maintenance alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert, idx) => (
          <AlertCard key={alert.id || idx} alert={alert} />
        ))}
      </div>
    </div>
  );
};
