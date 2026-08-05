import React from 'react';
import { Card, CardContent, Typography, Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const placeholderAssets = [
  { id: 'AST-101', name: 'CAT 320 Hydraulic Excavator', category: 'Heavy Equipment', status: 'Rented', dailyRate: '$450/day' },
  { id: 'AST-102', name: 'Genie S-60 XC Boom Lift', category: 'Aerial Lifts', status: 'Available', dailyRate: '$280/day' },
  { id: 'AST-103', name: 'Atlas Copco XAS 188 Compressor', category: 'Generators & Power', status: 'Maintenance', dailyRate: '$150/day' },
];

export const AssetsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Asset Catalog</h1>
          <p className="text-slate-400 text-sm">Manage rental equipment inventory and IoT sensor tracking status.</p>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}>
          Register New Asset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {placeholderAssets.map((asset) => (
          <Card key={asset.id} sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-start">
                <Typography variant="caption" className="text-cyan-400 font-mono">{asset.id}</Typography>
                <Chip
                  label={asset.status}
                  size="small"
                  color={asset.status === 'Available' ? 'success' : asset.status === 'Rented' ? 'info' : 'warning'}
                />
              </div>
              <Typography variant="h6" className="font-semibold">{asset.name}</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>Category: {asset.category}</Typography>
              <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center text-sm">
                <span className="text-slate-400">Daily Rate:</span>
                <span className="font-semibold text-emerald-400">{asset.dailyRate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
