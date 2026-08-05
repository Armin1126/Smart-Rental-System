import { backendApi } from './api';
import { MOCK_ALERTS } from '../constants/mockData';

export const getAlerts = async () => {
  try {
    const res = await backendApi.get('/alerts');
    return res.data;
  } catch (err) {
    console.warn('Backend API /alerts failed, using fallback alerts');
    return MOCK_ALERTS;
  }
};
