import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip } from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';

export const Navbar = () => {
  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', boxShadow: 'none' }}>
      <Toolbar className="justify-between">
        <Box className="flex items-center gap-3">
          <Box className="p-2 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-lg text-slate-950 shadow-lg shadow-amber-500/20 font-bold">
            <SensorsIcon />
          </Box>
          <Typography variant="h6" className="font-bold tracking-tight text-white">
            SmartRental <span className="text-amber-400 font-light">Caterpillar Fleet</span>
          </Typography>
        </Box>
        <Box className="flex items-center gap-3">
          <Chip label="IoT Telemetry Live" size="small" color="success" className="font-medium" />
          <Chip label="Platform Ready" size="small" variant="outlined" sx={{ color: '#94a3b8', borderColor: '#475569' }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
