import React from 'react';
import { Card, CardContent, Typography, Chip, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export const AlertCard = ({ alert, onAcknowledge }) => {
  const severityColors = {
    LOW: 'info',
    MEDIUM: 'warning',
    HIGH: 'error',
    CRITICAL: 'error',
  };

  return (
    <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <WarningAmberIcon className="text-amber-400" />
            <Typography variant="subtitle1" className="font-bold text-slate-100">
              {alert.alertType}
            </Typography>
          </div>
          <Chip label={alert.severity} size="small" color={severityColors[alert.severity] || 'warning'} />
        </div>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          {alert.message}
        </Typography>
        <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
          <span>Asset: AST-{alert.assetId} | Created: {alert.createdAt}</span>
          {!alert.acknowledged && (
            <Button size="small" variant="outlined" color="warning" onClick={() => onAcknowledge && onAcknowledge(alert.id)}>
              Acknowledge
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
