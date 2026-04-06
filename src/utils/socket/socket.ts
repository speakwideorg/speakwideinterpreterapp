import { io, Socket } from 'socket.io-client';
import { URL_LIST } from '../constants';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
    if (socket && socket.connected) {
        return socket;
    }

    socket = io(URL_LIST.base_url, {
        transports: ['websocket'],
        auth: {
            'x-access-token': token, //  matches backend verifyJWT
        },
        extraHeaders: {
            'x-access-token': token, // fallback
        },
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log(' Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
        console.log(' Socket disconnected');
    });

    socket.on('connect_error', err => {
        console.log(' Socket error:', err.message);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
