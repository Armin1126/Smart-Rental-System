import { backendApi } from './api';

export const getDashboardMetrics = async () => {
  try {
    const res = await backendApi.get('/dashboard');
    return res.data;
  } catch (err) {
    console.warn('Backend API /dashboard failed, using fallback metrics');
    return {
      totalAssets: 50,
      activeRentals: 32,
      overdueRentals: 5,
      totalAlerts: 14,
      criticalAlerts: 3,
      pendingRecommendations: 8,
      totalSites: 8,
      totalOperators: 25,
      assetsBySite: { 'S001': 8, 'S002': 7, 'S003': 10, 'S004': 5 },
      assetsByType: { 'Excavator': 12, 'Bulldozer': 8, 'Crane': 6, 'Skid Steer': 10 }
    };
  }
};
