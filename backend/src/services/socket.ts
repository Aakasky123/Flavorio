import type { Server } from 'socket.io';

let ioInstance: Server | null = null;

export const setIoInstance = (io: Server) => {
  ioInstance = io;
};

export const getIo = () => ioInstance;
