import { backendApi } from './api';
import { MOCK_RECOMMENDATIONS } from '../constants/mockData';

export const getRecommendations = async () => {
  try {
    const res = await backendApi.get('/recommendations');
    return res.data;
  } catch (err) {
    console.warn('Backend API /recommendations failed, using fallback recommendations');
    return MOCK_RECOMMENDATIONS;
  }
};
