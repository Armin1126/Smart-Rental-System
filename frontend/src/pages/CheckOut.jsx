import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';
import OutputIcon from '@mui/icons-material/Output';
import { MOCK_ASSETS, MOCK_SITES, MOCK_OPERATORS } from '../constants/mockData';
import { checkoutRental } from '../services/rentalService';

export const CheckOut = () => {
  const [formData, setFormData] = useState({
    assetId: '1',
    siteId: '1',
    operatorId: '1',
    customerName: 'Caterpillar Construction Corp',
    startDate: '2026-08-05'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await checkoutRental(formData);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Equipment Check-Out & Assignment</h1>
        <p className="text-slate-400 text-sm">Dispatch equipment, assign job site location, and select certified operator.</p>
      </div>

      <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
        <CardContent className="space-y-4">
          <Typography variant="h6" className="font-semibold text-amber-400 flex items-center gap-2">
            <OutputIcon /> Dispatch Assignment Form
          </Typography>

          {submitted && <Alert severity="success">Equipment check-out dispatch record created successfully!</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <TextField
              select
              fullWidth
              label="Select Equipment"
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              sx={{ input: { color: 'white' }, label: { color: '#94a3b8' }, '& .MuiOutlinedInput-root': { color: 'white' } }}
            >
              {MOCK_ASSETS.map((asset) => (
                <MenuItem key={asset.id} value={asset.id.toString()}>
                  {asset.assetCode} — {asset.name} ({asset.status})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Assign Job Site"
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              sx={{ label: { color: '#94a3b8' }, '& .MuiOutlinedInput-root': { color: 'white' } }}
            >
              {MOCK_SITES.map((site) => (
                <MenuItem key={site.id} value={site.id.toString()}>
                  {site.siteCode} — {site.name} ({site.city})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Assign Field Operator"
              value={formData.operatorId}
              onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
              sx={{ label: { color: '#94a3b8' }, '& .MuiOutlinedInput-root': { color: 'white' } }}
            >
              {MOCK_OPERATORS.map((op) => (
                <MenuItem key={op.id} value={op.id.toString()}>
                  {op.operatorCode} — {op.fullName} ({op.role})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Customer / Client Name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              sx={{ label: { color: '#94a3b8' }, '& .MuiOutlinedInput-root': { color: 'white' } }}
            />

            <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#ffcd00', color: '#111', fontWeight: 'bold', py: 1.5 }}>
              Confirm Check-Out & Dispatch
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
