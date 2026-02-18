import { Server } from "socket.io";
import { Server as HttpServer } from "http";

import logger from "../../utils/logger";
import { AppError } from "../../errors/app.error.";

export let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URLS,
            credentials: true,
            methods: ["GET", "POST"],
        },
        transports: ["websocket", "polling"],
    });

    io.on("connection", (socket) => {
        logger.info("Client connected :", socket.id);

        socket.on("join", (userId: string) => {
            socket.join(userId);
            logger.info(`User ${userId} joined room`);
        });

        socket.on("disconnect", () => {
            logger.warn("User disconnected");
        });
    });

    return io;
};

export const getIo = (): Server => {
    if (!io) throw new AppError("Socket initializaton failed");
    return io;
};
