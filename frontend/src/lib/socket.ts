import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

let socket: Socket | null = null;

/**
 * One socket.io connection, authenticated with the same JWT used for REST
 * calls, joined server-side to a per-tenant room. This is the channel
 * behind live dashboard/incident updates.
 */
export function useRealtimeSocket() {
  const token = useAuthStore((s) => s.token);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const url = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';
    socket = io(`${url}/realtime`, { query: { token }, transports: ['websocket'] });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token]);

  return { socket, connected };
}
