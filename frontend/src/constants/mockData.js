/**
 * Mock data for Smart Rental Asset Tracking System frontend prototype.
 */

export const MOCK_ASSETS = [
  { id: 1, assetCode: 'AST-101', name: 'CAT 320 Hydraulic Excavator', category: 'Earthmoving', status: 'RENTED', dailyRate: 450, latitude: 37.7749, longitude: -122.4194, siteId: 1 },
  { id: 2, assetCode: 'AST-102', name: 'Genie S-60 XC Boom Lift', category: 'Aerial Lifts', status: 'AVAILABLE', dailyRate: 280, latitude: 37.7833, longitude: -122.4167, siteId: 2 },
  { id: 3, assetCode: 'AST-103', name: 'Atlas Copco XAS 188 Compressor', category: 'Generators & Power', status: 'MAINTENANCE', dailyRate: 150, latitude: 37.7750, longitude: -122.4180, siteId: 1 },
  { id: 4, assetCode: 'AST-104', name: 'CAT D6 Dozer', category: 'Earthmoving', status: 'RENTED', dailyRate: 520, latitude: 37.7690, longitude: -122.4210, siteId: 3 },
  { id: 5, assetCode: 'AST-105', name: 'BOMAG BW 120 AD-5 Roller', category: 'Compaction', status: 'AVAILABLE', dailyRate: 210, latitude: 37.7800, longitude: -122.4100, siteId: 2 },
];

export const MOCK_TELEMETRY = [
  { id: 1, assetId: 1, timestamp: '08:00', engineTempCelsius: 88.5, vibrationHz: 24.2, batteryVoltage: 12.8, fuelLevelPct: 85.0, operatingHours: 1420.5 },
  { id: 2, assetId: 1, timestamp: '10:00', engineTempCelsius: 94.2, vibrationHz: 31.8, batteryVoltage: 12.7, fuelLevelPct: 78.5, operatingHours: 1422.5 },
  { id: 3, assetId: 1, timestamp: '12:00', engineTempCelsius: 105.8, vibrationHz: 68.4, batteryVoltage: 12.5, fuelLevelPct: 70.0, operatingHours: 1424.5 },
  { id: 4, assetId: 4, timestamp: '14:00', engineTempCelsius: 90.1, vibrationHz: 22.0, batteryVoltage: 13.0, fuelLevelPct: 92.0, operatingHours: 850.0 },
];

export const MOCK_ALERTS = [
  { id: 1, assetId: 1, alertType: 'VIBRATION_ANOMALY', severity: 'HIGH', message: 'Engine vibration exceeded 65Hz threshold', acknowledged: false, createdAt: '2026-08-05 12:05' },
  { id: 2, assetId: 3, alertType: 'MAINTENANCE_DUE', severity: 'MEDIUM', message: 'Scheduled 500-hour hydraulic fluid change due', acknowledged: true, createdAt: '2026-08-04 09:30' },
  { id: 3, assetId: 4, alertType: 'GEOFENCE_BREACH', severity: 'CRITICAL', message: 'Asset moved outside assigned Job Site #3 boundary', acknowledged: false, createdAt: '2026-08-05 13:45' },
];

export const MOCK_RECOMMENDATIONS = [
  { id: 1, assetId: 2, recommendationType: 'REALLOCATION', title: 'Reallocate Boom Lift to Site #3', description: 'Site #3 exhibits 40% higher aerial demand over the next 14 days.', confidenceScore: 0.88, impactScore: 'HIGH' },
  { id: 2, assetId: 5, recommendationType: 'PRICING_DISCOUNT', title: 'Promotional 15% Daily Rate Discount', description: 'Roller under-utilization detected (<15h/week). Discount will boost rental probability.', confidenceScore: 0.76, impactScore: 'MEDIUM' },
];

export const MOCK_SITES = [
  { id: 1, siteCode: 'SIT-001', name: 'San Francisco Main Depot', city: 'San Francisco', state: 'CA' },
  { id: 2, siteCode: 'SIT-002', name: 'Silicon Valley Equipment Hub', city: 'San Jose', state: 'CA' },
  { id: 3, siteCode: 'SIT-003', name: 'Oakland Port Yard', city: 'Oakland', state: 'CA' },
];

export const MOCK_OPERATORS = [
  { id: 1, operatorCode: 'OP-101', fullName: 'John Miller', role: 'FIELD_OPERATOR' },
  { id: 2, operatorCode: 'OP-102', fullName: 'Sarah Jenkins', role: 'MANAGER' },
  { id: 3, operatorCode: 'OP-103', fullName: 'David Chen', role: 'FIELD_OPERATOR' },
];
