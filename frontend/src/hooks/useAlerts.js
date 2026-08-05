import { useState, useEffect } from 'react';
import { getAlerts } from '../services/alertService';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts()
      .then((data) => setAlerts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return { alerts, loading };
};
