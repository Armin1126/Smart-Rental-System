import React from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AssetTable } from '../components/AssetTable';
import { MOCK_ASSETS } from '../constants/mockData';

export const Assets = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Equipment Catalog</h1>
          <p className="text-slate-400 text-sm">Manage equipment inventory, active status, and IoT sensor pairing.</p>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#ffcd00', color: '#111', '&:hover': { backgroundColor: '#e6b800' } }}>
          Register Equipment
        </Button>
      </div>
      <AssetTable assets={MOCK_ASSETS} />
    </div>
  );
};
