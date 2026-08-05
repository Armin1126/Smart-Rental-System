import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export const MetricCard = ({ title, value, subtitle, trend, color = 'text-amber-400' }) => {
  return (
    <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
      <CardContent className="space-y-1">
        <Typography variant="caption" sx={{ color: '#94a3b8' }} className="uppercase font-semibold tracking-wider">
          {title}
        </Typography>
        <Typography variant="h4" className={`font-bold ${color}`}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: '#94a3b8' }} className="pt-1">
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Typography variant="caption" className="text-emerald-400 font-medium">
            {trend}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
