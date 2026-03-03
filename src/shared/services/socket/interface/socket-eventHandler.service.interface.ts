export interface ISocketEventHandler {
    handleConnection(socket: unknown): void;
    handleDisconnection(socket: unknown): void;
    handleMarkAsRead(socket: unknown, data: { notificationId: string }): Promise<void>;
    handleMarkAllAsRead(socket: unknown): Promise<void>;
    handleGetUnreadCount(socket: unknown): Promise<void>;
    getCountByUserId(userId: string, isUnread: boolean): Promise<number>;
}
