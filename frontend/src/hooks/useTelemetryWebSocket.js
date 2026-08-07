import { useState, useEffect, useRef, useCallback } from 'react';

export const useTelemetryWebSocket = (url = 'ws://localhost:8080/ws-raw') => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [updateCount, setUpdateCount] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log('Connected to Telemetry WebSocket stream:', url);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CONNECTED') return;

          setLatestUpdate(data);
          setUpdateCount((prev) => prev + 1);
          setUpdateHistory((prev) => [data, ...prev.slice(0, 49)]);
        } catch (e) {
          console.warn('Failed to parse WebSocket telemetry frame:', e);
        }
      };

      socket.onerror = (err) => {
        console.warn('WebSocket telemetry stream error:', err);
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('Telemetry WebSocket stream disconnected. Reconnecting in 3s...');
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (e) {
      console.error('Failed to instantiate WebSocket connection:', e);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { isConnected, latestUpdate, updateHistory, updateCount };
};
