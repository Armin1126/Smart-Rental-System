import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip } from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';

export const Navbar: React.FC = () => {
  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', boxShadow: 'none' }}>
      <Toolbar className="justify-between">
        <Box className="flex items-center gap-3">
          <Box className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg text-white shadow-lg shadow-cyan-500/20">
            <SensorsIcon />
          </Box>
          <Typography variant="h6" className="font-bold tracking-tight text-white">
            SmartRental <span className="text-cyan-400 font-light">Asset Tracker</span>
          </Typography>
        </Box>
        <Box className="flex items-center gap-3">
          <Chip label="System Online" size="small" color="success" className="font-medium" />
          <Chip label="Hackathon Workspace" size="small" variant="outlined" sx={{ color: '#94a3b8', borderColor: '#475569' }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
