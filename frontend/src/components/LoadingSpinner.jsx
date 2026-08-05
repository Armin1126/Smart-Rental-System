import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

export const LoadingSpinner = ({ label = 'Loading operational data...' }) => {
  return (
    <Box className="flex flex-col items-center justify-center p-12 space-y-4">
      <CircularProgress sx={{ color: '#ffcd00' }} />
      <Typography variant="body2" className="text-slate-400 font-medium">
        {label}
      </Typography>
    </Box>
  );
};
