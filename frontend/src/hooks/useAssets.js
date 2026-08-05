import { useState, useEffect } from 'react';
import { getAssets } from '../services/assetService';

export const useAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssets()
      .then((data) => setAssets(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return { assets, loading };
};
