import { CreateNotificationParams } from "../../../interfaces/notification-interfaces";
import { INotification } from "../../../models/notifications/notification.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";

export interface INotificationService {
    createNotification(params: CreateNotificationParams): Promise<INotification>;

    getNotifications(
        userId: string,
        page?: number,
        limit?: number,
        unreadOnly?: boolean,
    ): Promise<{ notifications: INotification[]; paginationMeta: PaginationMeta }>;

    getUnreadCount(userId: string): Promise<number>;

    markAsRead(notificationId: string, userId: string): Promise<INotification | null>;

    markAllAsRead(userId: string): Promise<number>;

    deleteNotification(notificationId: string, userId: string): Promise<boolean>;

    deleteAllRead(userId: string): Promise<number>;

    notifyApplicationStatusChange(
        userId: string,
        jobTitle: string,
        userRole: "User" | "Company",
        companyName: string,
        status: string,
        applicationId: string,
    ): Promise<INotification>;

    notifyNewApplication(
        companyId: string,
        candidateName: string,
        jobTitle: string,
        applicationId: string,
    ): Promise<INotification>;

    notifyInterviewScheduled(
        userId: string,
        jobTitle: string,
        companyName: string,
        interviewDate: Date,
        applicationId: string,
    ): Promise<INotification>;

    notifyJobPosted(userIds: string[], jobTitle: string, companyName: string, jobId: string): Promise<INotification[]>;
}
