import {
    INotification,
    NOTIFICATION_PRIORITIES,
    NOTIFICATION_TYPES,
} from "../../../models/notifications/notification.interface";
import mongoose, { Types } from "mongoose";
import { CreateNotificationParams } from "../../../interfaces/notification-interfaces";
import { INotificationService } from "../interface/notification.service.interface";
import { INotificationRepository } from "../../../repositories/notification/notification.repository.interface";
import { PaginationMeta } from "../../../utils/apiResponse.utils";
import { NOTIFICATION_MESSAGES } from "../../../constants/messages/notification.messages";
import logger from "../../../utils/logger";
import { AppError } from "../../../errors-classes/app.error.";
import { ValidationError } from "../../../errors-classes/validation.error";
import { USER_AUTH_MESSAGES } from "../../../constants/messages/user.messages.constants";

export class NotificationService implements INotificationService {
    constructor(private notificationRepository: INotificationRepository) {}

    /**
     * Create notification
     */
    async createNotification(params: CreateNotificationParams): Promise<INotification> {
        if (!mongoose.Types.ObjectId.isValid(params.userId)) {
            logger.error("Invalid userId provided while creating notification");
            throw new AppError("invalid user object id is provided ");
        }

        return await this.notificationRepository.create({
            userId: new Types.ObjectId(params.userId),
            userModel: params.userModel || "User",
            type: params.type,
            title: params.title,
            message: params.message,
            priority: params.priority || NOTIFICATION_PRIORITIES.MEDIUM,
            link: params.link,
            metadata: params.metadata,
            isRead: false,
        });
    }

    /**
     * Get user notifications with pagination
     */
    async getNotifications(
        userId: string,
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false,
    ): Promise<{ notifications: INotification[]; paginationMeta: PaginationMeta }> {
        const [notifications, total] = await this.notificationRepository.getNotificationsPaginated(
            userId,
            page,
            limit,
            unreadOnly,
        );

        const totalPages = Math.ceil(total / limit);
        const totalItems = total;

        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalPages,
            totalItems,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
        return { notifications, paginationMeta };
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return await this.notificationRepository.count({
            userId: new Types.ObjectId(userId),
            isRead: false,
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {

        if (!notificationId) {
            throw new ValidationError(NOTIFICATION_MESSAGES.NOTIFICATION_ID_MISSING, 401);
        }
        if (!userId) {
            throw new ValidationError(USER_AUTH_MESSAGES.USER_ID_MISSING, 401);
        }

        const notification = await this.notificationRepository.markAsRead(notificationId, userId);

        if (!notification) {
            throw new ValidationError(NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND_OR_UNAUTHORIZED_ACCESS, 401);
        }

        return notification;
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string): Promise<number> {
        const filter = {
            userId: new Types.ObjectId(userId),
            isRead: false,
        };
        const update = {
            isRead: true,
            readAt: new Date(),
        };

        const result = await this.notificationRepository.updateMany(filter, update);

        return result.modifiedCount;
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
        const filter = {
            _id: new Types.ObjectId(notificationId),
            userId: new Types.ObjectId(userId),
        };

        const result = await this.notificationRepository.deleteNotification(filter);

        if (!result.deletedCount || result.deletedCount === 0) {
            throw new Error("Notification not found or you don't have permission to delete it");
        }

        return result.deletedCount > 0;
    }

    /**
     * Delete all read notifications
     */
    async deleteAllRead(userId: string): Promise<number> {
        const result = await this.notificationRepository.deleteNotification({
            userId: new Types.ObjectId(userId),
            isRead: true,
        });

        return result.deletedCount;
    }

    /**
     * Create notification for application status change
     */
    async notifyApplicationStatusChange(
        userId: string,
        userRole: "User" | "Company",
        jobTitle: string,
        companyName: string,
        status: string,
        applicationId: string,
    ): Promise<INotification> {
        const notification = await this.notificationRepository.create({
            userId: new Types.ObjectId(userId),
            userModel: userRole,
            type: NOTIFICATION_TYPES.APPLICATION_STATUS,
            title: NOTIFICATION_MESSAGES.APPLICATION_STATUS_UPDATED,
            message: `Your application for ${jobTitle} at ${companyName} is now ${status}`,
            priority: NOTIFICATION_PRIORITIES.HIGH,
            // link: `/applications/${applicationId}`,
            metadata: { applicationId: new Types.ObjectId(applicationId) },
        });
        return notification;
    }

    /**
     * Create notification for new application (for company)
     */
    async notifyNewApplication(
        companyId: string,
        candidateName: string,
        jobTitle: string,
        applicationId: string,
    ): Promise<INotification> {
        return await this.createNotification({
            userId: companyId,
            userModel: "Company",
            type: NOTIFICATION_TYPES.NEW_APPLICATION,
            title: "New Application Received",
            message: `${candidateName} has applied for ${jobTitle}`,
            priority: NOTIFICATION_PRIORITIES.MEDIUM,
            link: `/company/applications/${applicationId}`,
            metadata: { applicationId: new Types.ObjectId(applicationId) },
        });
    }

    /**
     * Create notification for interview scheduled
     */
    async notifyInterviewScheduled(
        userId: string,
        jobTitle: string,
        companyName: string,
        interviewDate: Date,
        applicationId: string,
    ): Promise<INotification> {
        return await this.notificationRepository.create({
            userId: new Types.ObjectId(userId),
            userModel: "User",
            type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
            title: "Interview Scheduled",
            message: `Interview for ${jobTitle} at ${companyName} scheduled for ${interviewDate.toLocaleDateString()}`,
            priority: NOTIFICATION_PRIORITIES.URGENT,
            // link: `/applications/${applicationId}`,
            metadata: { applicationId: new Types.ObjectId(applicationId), interviewDate: interviewDate.toISOString() },
        });
    }

    /**
     * Create notification for new job posted
     */
    async notifyJobPosted(
        userIds: string[],
        jobTitle: string,
        companyName: string,
        jobId: string,
    ): Promise<INotification[]> {
        const notifications: INotification[] = [];

        for (const userId of userIds) {
            const notification = await this.notificationRepository.create({
                userId: new Types.ObjectId(userId),
                type: NOTIFICATION_TYPES.JOB_POSTED,
                title: "New Job Posted",
                message: `${companyName} has posted a new job: ${jobTitle}`,
                priority: NOTIFICATION_PRIORITIES.LOW,
                link: `/jobs/${jobId}`,
                metadata: { jobId: new Types.ObjectId(jobId) },
            });
            notifications.push(notification);
        }

        return notifications; ///danger code need to change later to create in bulk
    }
}
