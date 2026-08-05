import { backendApi } from './api';
import { MOCK_TELEMETRY } from '../constants/mockData';

export const postTelemetry = async (telemetryPayload) => {
  try {
    const res = await backendApi.post('/telemetry', telemetryPayload);
    return res.data;
  } catch (err) {
    return { status: 'RECEIVED', data: telemetryPayload };
  }
};

export const getTelemetryByAsset = async (assetId) => {
  try {
    const res = await backendApi.get(`/telemetry/asset/${assetId}`);
    return res.data;
  } catch (err) {
    return MOCK_TELEMETRY.filter(t => t.assetId === Number(assetId));
  }
};
