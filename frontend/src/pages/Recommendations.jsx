import React from 'react';
import { RecommendationCard } from '../components/RecommendationCard';
import { MOCK_RECOMMENDATIONS } from '../constants/mockData';

export const Recommendations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Predictive Recommendation Engine</h1>
        <p className="text-slate-400 text-sm">AI-driven equipment reallocations, demand forecasting, and dynamic pricing optimizations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_RECOMMENDATIONS.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
};
