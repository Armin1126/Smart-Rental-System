import React from 'react';
import { AlertCard } from '../components/AlertCard';
import { MOCK_ALERTS } from '../constants/mockData';

export const Alerts = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Alerts & Notifications</h1>
        <p className="text-slate-400 text-sm">Under-utilization flags, vibration anomalies, geofence breaches & maintenance reminders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_ALERTS.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
};
