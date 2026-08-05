import React from 'react';
import { Card, CardContent, Typography, Button, Chip } from '@mui/material';

const placeholderRentals = [
  { id: 'RNT-2026-01', client: 'Apex Construction Corp', asset: 'CAT 320 Hydraulic Excavator', startDate: '2026-08-01', endDate: '2026-08-15', status: 'Active' },
  { id: 'RNT-2026-02', client: 'BuildTech Infra Solutions', asset: 'Genie S-60 XC Boom Lift', startDate: '2026-08-10', endDate: '2026-08-20', status: 'Reserved' },
];

export const RentalsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Rental Contracts & Lifecycle</h1>
          <p className="text-slate-400 text-sm">Monitor ongoing customer leases, reservations, and returns.</p>
        </div>
        <Button variant="outlined" sx={{ color: '#06b6d4', borderColor: '#06b6d4' }}>
          Create Rental Agreement
        </Button>
      </div>

      <div className="space-y-3">
        {placeholderRentals.map((rental) => (
          <Card key={rental.id} sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
            <CardContent className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Typography variant="subtitle1" className="font-bold text-cyan-400 font-mono">{rental.id}</Typography>
                  <Chip label={rental.status} size="small" color={rental.status === 'Active' ? 'success' : 'secondary'} />
                </div>
                <Typography variant="body1" className="font-semibold text-slate-200 mt-1">{rental.client}</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>Asset: {rental.asset}</Typography>
              </div>
              <div className="text-right">
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Lease Period</Typography>
                <Typography variant="body2" className="font-mono text-slate-300">{rental.startDate} → {rental.endDate}</Typography>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
