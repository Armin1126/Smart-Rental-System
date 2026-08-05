import React from 'react';

export const TelemetryTable = ({ telemetryLogs = [] }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-800/60">
      <table className="w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-700">
          <tr>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Asset ID</th>
            <th className="px-4 py-3">Engine Temp</th>
            <th className="px-4 py-3">Vibration</th>
            <th className="px-4 py-3">Battery</th>
            <th className="px-4 py-3">Fuel Level</th>
            <th className="px-4 py-3">Op Hours</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {telemetryLogs.map((log, idx) => (
            <tr key={log.id || idx} className="hover:bg-slate-700/30 transition-colors">
              <td className="px-4 py-3 font-mono text-slate-400">{log.timestamp}</td>
              <td className="px-4 py-3 font-mono text-amber-400">AST-{log.assetId}</td>
              <td className={`px-4 py-3 font-mono ${log.engineTempCelsius > 100 ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                {log.engineTempCelsius}°C
              </td>
              <td className={`px-4 py-3 font-mono ${log.vibrationHz > 60 ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
                {log.vibrationHz} Hz
              </td>
              <td className="px-4 py-3 font-mono text-slate-300">{log.batteryVoltage}V</td>
              <td className="px-4 py-3 font-mono text-cyan-400">{log.fuelLevelPct}%</td>
              <td className="px-4 py-3 font-mono text-slate-300">{log.operatingHours} hrs</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
