import React, { useState, useEffect } from 'react';
import { CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { TelemetryTable } from '../components/TelemetryTable';
import { getTelemetryForAsset } from '../services/telemetryService';

export const Telemetry = () => {
  const [assetId, setAssetId] = useState('EQX1001');
  const [searchId, setSearchId] = useState('EQX1001');
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTelemetryForAsset(assetId);
        setTelemetryLogs(data || []);
      } catch (err) {
        console.error('Error fetching telemetry:', err);
        setError(`Unable to fetch telemetry for ${assetId}. Displaying cached telemetry logs.`);
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
  }, [assetId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      setAssetId(searchId.trim());
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {error && (
        <Alert severity="warning" className="rounded-lg shadow-2xs">
          {error}
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IoT Telemetry Feed</h1>
          <p className="text-gray-500 text-xs">High-frequency sensor logs: speed, operating hours, engine status, fuel levels, DTC codes.</p>
        </div>

        {/* Asset Filter Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-2.5 text-gray-400" fontSize="small" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Equipment ID (e.g. EQX1001)"
              className="bg-white text-gray-800 placeholder-gray-400 text-xs pl-8 pr-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-gray-500 w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            Fetch Logs
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 bg-white p-8 rounded-md border border-gray-200">
          <CircularProgress sx={{ color: '#ffcd00' }} />
          <p className="text-gray-500 text-xs font-medium">Retrieving telemetry records for {assetId}...</p>
        </div>
      ) : (
        <TelemetryTable telemetryLogs={telemetryLogs} />
      )}
    </div>
  );
};
