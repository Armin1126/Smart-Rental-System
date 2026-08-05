import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const RecommendationCard = ({ recommendation }) => {
  return (
    <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <AutoAwesomeIcon className="text-amber-400" />
            <Typography variant="subtitle1" className="font-bold text-slate-100">
              {recommendation.title}
            </Typography>
          </div>
          <Chip label={`${Math.round(recommendation.confidenceScore * 100)}% Confidence`} size="small" color="success" />
        </div>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          {recommendation.description}
        </Typography>
        <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400">
          <span>Type: {recommendation.recommendationType}</span>
          <span className="font-semibold text-amber-400">Impact: {recommendation.impactScore || 'HIGH'}</span>
        </div>
      </CardContent>
    </Card>
  );
};
