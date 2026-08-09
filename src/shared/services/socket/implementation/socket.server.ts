import { Server, Socket } from "socket.io";
import { ISocketService } from "../interface/socket.service.interface";
import { parse } from "cookie";
import { Server as HttpServer } from "http";
import { ISocketEventHandler } from "../interface/socket-eventHandler.service.interface";
import { IUserSocketMapService } from "../interface/socket-map.service.interface";
import { INotificationRepository } from "../../../../repositories/notification/notification.repository.interface";
import { AuthError } from "../../../../errors-classes/auth.error";
import { verifyAccessToken } from "../../../../utils/jwt.utils";
import { SocketData } from "../../../../interfaces/socket-interfaces";
import logger from "../../../../utils/logger";
import { INotification } from "../../../../models/notifications/notification.interface";
import { IWebRTCEventHandler } from "../../../../services/Webrtc/interfaces/Webrtc.event-handler.service.interface";
import { IChatEventHandler } from "../interface/chat-eventHandler.interface";

export class SocketServer implements ISocketService {
    private io!: Server;

    constructor(
        // httpServer: HttpServer,
        private readonly eventHandlerService: ISocketEventHandler,
        private readonly userSocketMap: IUserSocketMapService,
        private readonly webRtcHandler: IWebRTCEventHandler,
        private notificationRepository: INotificationRepository,
        private readonly chatHandler: IChatEventHandler,
    ) // private readonly frontendUrl: string,
    {}

    public connect(httpServer: HttpServer, frontendUrl: string) {
        this.io = new Server(httpServer, {
            cors: {
                origin: frontendUrl,
                credentials: true,
                methods: ["GET", "POST"],
            },
            transports: ["websocket", "polling"],
            allowEIO3: true,
        });

        this.setupMiddleware();
        this.setupEventHandlers(); //setsup basic connection, disconnection, and error handlers.  .
    }

    //setup middleware to authenticate socket connections using JWT from cookies
    private setupMiddleware(): void {
        this.io.use(async (socket: Socket, next) => {
            try {
                // Extract cookies from handshake
                const cookieHeader = socket.handshake.headers.cookie;

                if (!cookieHeader) {
                    return next(new AuthError("No authentication cookies found"));
                }

                // Parse cookies
                const cookies = parse(cookieHeader);
                const accessToken = cookies.accessToken;

                if (!accessToken) {
                    return next(new AuthError("Access token not found"));
                }

                // Use your existing token verification function
                const { sub, role } = verifyAccessToken(accessToken);

                const decoded: SocketData = { userId: sub, role };

                if (!decoded || !decoded.userId) {
                    return next(new Error("Invalid token"));
                }

                // Attach user data to socket
                socket.data = decoded as SocketData;

                next();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Authentication failed";
                next(new Error(errorMessage));
            }
        });
    }

    private setupEventHandlers(): void {
        this.io.on("connection", async (socket: Socket) => {
            //handle connection
            this.eventHandlerService.handleConnection(socket);

            //register video call based events
            this.webRtcHandler.register(socket, this.io);

            this.chatHandler.register(socket, this.io);

            // Handle get unread count
            socket.on("notification:getCount", async () => {
                await this.eventHandlerService.handleGetUnreadCount(socket);
            });

            // Handle mark as read
            socket.on("notification:markRead", async (data: { notificationId: string }) => {
                await this.eventHandlerService.handleMarkAsRead(socket, data);
            });

            // Handle mark all as read
            socket.on("notification:markAllRead", async () => {
                await this.eventHandlerService.handleMarkAllAsRead(socket);
            });

            // Handle disconnect
            socket.on("disconnect", () => {
                this.eventHandlerService.handleDisconnection(socket);
            });

            // Handle errors
            socket.on("error", (error: Error) => {
                logger.error("Socket error:", error);
            });
        });

        // Handle server errors
        this.io.engine.on("connection_error", (err) => {
            logger.error("Socket.IO connection error:", err);
        });
    }

    /**
     * Send notification to specific user
     */
    async sendNotificationToUser(userId: string, notification: INotification): Promise<void> {
        this.io.to(`user:${userId}`).emit("notification:new", notification);
        await this.sendUnreadCountToUserRoom(userId);
    }

    /**
     * Send notification to multiple users
     */
    async sendNotificationToUsers(userIds: string[], notification: INotification): Promise<void> {
        for (const userId of userIds) {
            await this.sendNotificationToUser(userId, notification);
        }
    }

    /**
     * Send unread count to specific user
     */
    sendUnreadCountToUser(userId: string, count: number): void {
        this.io.to(`user:${userId}`).emit("notification:count", { count });
    }

    /**
     * Check if user is online
     */
    isUserOnline(userId: string): boolean {
        return this.userSocketMap.hasUser(userId);
    }

    /**
     * Get total connected users count
     */
    getConnectedUsersCount(): number {
        return this.userSocketMap.getConnectedUsersCount();
    }

    /**
     * Get Socket.IO server instance
     */
    getIO(): Server {
        return this.io;
    }

    /**
     * Close all connections and cleanup
     */
    async close(): Promise<void> {
        this.userSocketMap.clear();
        await this.io.close();
    }

    /**
     * Send unread count to user's room (internal helper)
     */
    private async sendUnreadCountToUserRoom(userId: string): Promise<void> {
        try {
            const count = await this.eventHandlerService.getCountByUserId(userId, true);
            this.sendUnreadCountToUser(userId, count);
        } catch (error) {
            console.error("Error sending unread count:", error);
        }
    }
}
