import { io } from 'socket.io-client';

// If in production (served by Express), connect to the same host
const URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? undefined : 'http://localhost:3001');

export const socket = io(URL, {
  autoConnect: false
});
