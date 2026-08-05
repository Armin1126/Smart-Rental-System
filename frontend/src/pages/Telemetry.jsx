import React from 'react';
import { TelemetryTable } from '../components/TelemetryTable';
import { MOCK_TELEMETRY } from '../constants/mockData';

export const Telemetry = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Live Telemetry Tracking</h1>
        <p className="text-slate-400 text-sm">Real-time IoT engine temp, vibration Hz, battery voltage, and operating metrics.</p>
      </div>

      <TelemetryTable telemetryLogs={MOCK_TELEMETRY} />
    </div>
  );
};
