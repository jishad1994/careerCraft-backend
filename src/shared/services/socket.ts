import { Server } from "socket.io";
import { Server as HttpServer } from "http";

import logger from "../../utils/logger";

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
        logger.info("Clinet connected :", socket.id);

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
