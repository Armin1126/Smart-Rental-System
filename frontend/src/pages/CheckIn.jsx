import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import InputIcon from '@mui/icons-material/Input';
import { checkinRental } from '../services/rentalService';

export const CheckIn = () => {
  const [formData, setFormData] = useState({
    rentalCode: 'RNT-1001',
    returnDate: '2026-08-15',
    totalHoursUsed: '120.5'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await checkinRental(formData);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Equipment Check-In & Inspection</h1>
        <p className="text-slate-400 text-sm">Process asset returns, record operating hours, and conclude lease agreements.</p>
      </div>

      <Card sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
        <CardContent className="space-y-4">
          <Typography variant="h6" className="font-semibold text-emerald-400 flex items-center gap-2">
            <InputIcon /> Return Inspection Form
          </Typography>

          {submitted && <Alert severity="success">Asset return inspection & Check-In processed successfully!</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Rental Contract Code"
              value={formData.rentalCode}
              onChange={(e) => setFormData({ ...formData, rentalCode: e.target.value })}
              sx={{ label: { color: '#94a3b8' }, '& .MuiOutlinedInput-root': { color: 'white' } }}
            />

            <TextField
              fullWidth
              label="Return Date"
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              sx={{ label: { color: '#94a3b8' }, '& .MuiOutlinedInput-root': { color: 'white' } }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Total Operating Hours Recorded"
              type="number"
              value={formData.totalHoursUsed}
              onChange={(e) => setFormData({ ...formData, totalHoursUsed: e.target.value })}
              sx={{ label: { color: '#94a3b8' }, '& .MuiOutlinedInput-root': { color: 'white' } }}
            />

            <Button type="submit" variant="contained" fullWidth color="success" sx={{ py: 1.5, fontWeight: 'bold' }}>
              Process Return & Complete Check-In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
