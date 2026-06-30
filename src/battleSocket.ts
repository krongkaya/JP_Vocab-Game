import { io as ioClient, Socket } from 'socket.io-client';
import type { RoomSnapshot, Player } from '../server/types';

// Use Vite proxy in dev (same origin), direct URL if VITE_SERVER_URL is set
const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? window.location.origin;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = ioClient(SERVER_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
      path: '/socket.io',
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

// Typed emitters
export const battleApi = {
  createRoom(levelId: number, nickname: string) {
    getSocket().emit('create-room', { levelId, nickname });
  },
  joinRoom(code: string, nickname: string) {
    getSocket().emit('join-room', { code, nickname });
  },
  startGame(code: string) {
    getSocket().emit('start-game', { code });
  },
  sendAnswer(code: string, answer: string) {
    getSocket().emit('answer', { code, answer });
  },
};

export type { RoomSnapshot, Player };
