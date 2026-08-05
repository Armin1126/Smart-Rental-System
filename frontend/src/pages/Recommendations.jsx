import React, { useState, useEffect } from 'react';
import { CircularProgress, Alert } from '@mui/material';
import { RecommendationCard } from '../components/RecommendationCard';
import { getRecommendations } from '../services/recommendationService';

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecommendations();
        setRecommendations(data || []);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError('Unable to fetch recommendations from Spring Boot backend. Displaying cached recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <CircularProgress sx={{ color: '#ffcd00' }} />
        <p className="text-gray-500 text-xs font-medium">Computing AI Recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {error && (
        <Alert severity="warning" className="rounded-lg shadow-2xs">
          {error}
        </Alert>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Recommendation Engine</h1>
        <p className="text-gray-500 text-xs">Cross-referenced insights for equipment reallocation, early returns, rental extensions, and refuel alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => (
          <RecommendationCard key={rec.id || idx} recommendation={rec} />
        ))}
      </div>
    </div>
  );
};
