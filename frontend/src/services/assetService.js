import { backendApi } from './api';
import { MOCK_ASSETS } from '../constants/mockData';

export const getAssets = async () => {
  try {
    const res = await backendApi.get('/assets');
    return res.data;
  } catch (err) {
    console.warn('Backend API offline, falling back to mock assets dataset.');
    return MOCK_ASSETS;
  }
};

export const createAsset = async (assetData) => {
  const res = await backendApi.post('/assets', assetData);
  return res.data;
};
