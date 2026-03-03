import { SocketData } from "../../../../interfaces/socket-interfaces";
import { INotificationRepository } from "../../../../repositories/notification/notification.repository.interface";
import logger from "../../../../utils/logger";
import { ISocketEventHandler } from "../interface/socket-eventHandler.service.interface";

import { Socket } from "socket.io";
import { IUserSocketMapService } from "../interface/socket-map.service.interface";

export class SocketEventHandlerService implements ISocketEventHandler {
    constructor(
        private readonly notificationRepository: INotificationRepository,
        private readonly userSocketMapService: IUserSocketMapService,
    ) {}

    /**
     * Handle new socket connection
     */
    handleConnection(socket: Socket): void {
        const userData = socket.data as SocketData;

        logger.info(`User connected on socket: ${userData.userId} (${socket.id})`);

        // Add socket to user's socket set
        this.userSocketMapService.addSocket(userData.userId, socket.id);

        // Join user to their personal room
        socket.join(`user:${userData.userId}`);

        // Send initial unread count
        this.sendUnreadCount(socket, userData.userId);
    }

    /**
     * Handle socket disconnection
     */
    handleDisconnection(socket: Socket): void {
        const userData = socket.data as SocketData;

        console.log(`User disconnected: ${userData.userId} (${socket.id})`);

        // Remove socket from user's socket set
        this.userSocketMapService.removeSocket(userData.userId, socket.id);
    }

    /**
     * Handle mark notification as read
     */
    async handleMarkAsRead(socket: Socket, data: { notificationId: string }): Promise<void> {
        const userData = socket.data as SocketData;

        try {
            await this.notificationRepository.markAsRead(data.notificationId, userData.userId);

            // Send updated unread count
            await this.sendUnreadCount(socket, userData.userId);
        } catch (error) {
            console.error("Error marking notification as read:", error);
            socket.emit("error", { message: "Failed to mark notification as read" });
        }
    }

    /**
     * Handle mark all notifications as read
     */
    async handleMarkAllAsRead(socket: Socket): Promise<void> {
        const userData = socket.data as SocketData;

        try {
            await this.notificationRepository.markAllAsRead(userData.userId);

            // Send updated unread count (should be 0)
            socket.emit("notification:count", { count: 0 });
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            socket.emit("error", { message: "Failed to mark all notifications as read" });
        }
    }

    /**
     * Handle get unread count request
     */
    async handleGetUnreadCount(socket: Socket): Promise<void> {
        const userData = socket.data as SocketData;
        await this.sendUnreadCount(socket, userData.userId);
    }

    /**
     * Send unread count to user
     */
    private async sendUnreadCount(socket: Socket, userId: string): Promise<void> {
        try {
            const count = await this.notificationRepository.countByUserId(userId, true);
            socket.emit("notification:count", { count });
        } catch (error) {
            console.error("Error sending unread count:", error);
        }
    }

     async getCountByUserId(userId: string, isUnread: boolean = true): Promise<number> {
        try {
            return await this.notificationRepository.countByUserId(userId, isUnread);
        } catch (error) {
            logger.error("Error getting unread count for user:", error);
            throw error;
        }
    }
}
