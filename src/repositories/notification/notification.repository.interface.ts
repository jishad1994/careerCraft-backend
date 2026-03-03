import { INotification } from "../../models/notifications/notification.interface";
import { IBaseRepository } from "../base-repository/base.repository.inteface";

export interface INotificationRepository extends IBaseRepository<INotification> {
    getNotificationsPaginated(
        userId: string,
        page: number,
        limit: number,
        unreadOnly: boolean,
    ): Promise<[notifications: INotification[], total: number]>;

    deleteNotification(filter: Partial<INotification>): Promise<{ deletedCount: number }>;

    markAsRead(notificationId: string, userId: string): Promise<INotification | null>;

    markAllAsRead(userId: string): Promise<{ modifiedCount: number }>;
    
    countByUserId(userId: string, unreadOnly: boolean): Promise<number>;
}
