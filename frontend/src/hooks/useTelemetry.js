import { useState, useEffect } from 'react';
import { getTelemetryByAsset } from '../services/telemetryService';
import { MOCK_TELEMETRY } from '../constants/mockData';

export const useTelemetry = (assetId = 1) => {
  const [telemetry, setTelemetry] = useState(MOCK_TELEMETRY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTelemetryByAsset(assetId)
      .then((data) => setTelemetry(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [assetId]);

  return { telemetry, loading };
};
