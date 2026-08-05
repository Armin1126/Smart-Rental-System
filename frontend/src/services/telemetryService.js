import { backendApi } from './api';
import { MOCK_TELEMETRY } from '../constants/mockData';

export const getTelemetryForAsset = async (assetId = 'EQX1001') => {
  try {
    const res = await backendApi.get(`/telemetry/${assetId}`);
    return res.data;
  } catch (err) {
    console.warn(`Backend API /telemetry/${assetId} failed, using fallback telemetry`);
    return MOCK_TELEMETRY;
  }
};
