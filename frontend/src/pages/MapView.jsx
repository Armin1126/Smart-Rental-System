import React, { useState, useEffect } from 'react';
import { CircularProgress, Alert } from '@mui/material';
import { MapComponent } from '../components/MapComponent';
import { getAssets } from '../services/assetService';

export const MapView = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssetLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAssets();
        setAssets(data || []);
      } catch (err) {
        console.error('Error fetching assets for MapView:', err);
        setError('Unable to fetch live GPS asset coordinates. Displaying cached map coordinates.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssetLocations();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white p-8 rounded-md border border-gray-200">
        <CircularProgress sx={{ color: '#ffcd00' }} />
        <p className="text-gray-500 text-xs font-medium">Initializing GPS Asset Map Coordinates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {error && (
        <Alert severity="warning" className="rounded-lg shadow-2xs">
          {error}
        </Alert>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live GPS Fleet Map</h1>
        <p className="text-gray-500 text-xs">Geospatial tracking view showing Caterpillar equipment positions and active job sites.</p>
      </div>

      <MapComponent assets={assets} />
    </div>
  );
};
