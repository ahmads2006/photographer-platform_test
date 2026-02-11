'use client';

import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  if (!token) return null;

  if (socket) {
    socket.disconnect();
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};
