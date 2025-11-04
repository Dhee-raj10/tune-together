import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = io(WS_URL, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected
  };
};