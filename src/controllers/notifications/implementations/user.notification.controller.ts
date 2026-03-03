import { NOTIFICATION_MESSAGES } from "../../../constants/messages/notification.messages";
import { AppError } from "../../../errors-classes/app.error.";
import { NotificationQueryParams } from "../../../interfaces/notification-interfaces";
import { INotificationService } from "../../../services/notification/interface/notification.service.interface";
import { ApiResponse } from "../../../utils/apiResponse.utils";
import { IUserNotificationController } from "../interfaces/user.notification.controller.interface";

import { Request, Response, NextFunction } from "express";

export class UserNotificationController implements IUserNotificationController {
    constructor(private _notificationService: INotificationService) {}

    /**
     * Get notifications with pagination
     * GET /api/notifications
     */
    async getNotifications(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Unauthorized", 401);
            }

            const query = req.query as NotificationQueryParams;
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 20;
            const unreadOnly = query.unreadOnly === "true";

            const { notifications, paginationMeta } = await this._notificationService.getNotifications(
                userId,
                page,
                limit,
                unreadOnly,
            );

            return ApiResponse.success(
                res,
                NOTIFICATION_MESSAGES.NOTIFICATION_RETRIEVED,
                notifications,
                200,
                paginationMeta,
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get unread count
     * GET /api/notifications/unread-count
     */
    async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError("Unauthorized", 401);
            }

            const count = await this._notificationService.getUnreadCount(userId);

            return ApiResponse.success<{ count: number }>(
                res,
                NOTIFICATION_MESSAGES.UNREAD_COUNT_RETRIEVED,
                { count },
                200,
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark notification as read
     * PATCH /api/notifications/:id/read
     */
    async markAsRead(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Unauthorized", 401);
            }

            const { id } = req.params;

            const notification = await this._notificationService.markAsRead(id, userId);

            return ApiResponse.success(res, "Notification marked as read", notification, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark all notifications as read
     * PATCH /api/notifications/mark-all-read
     */
    async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError("Unauthorized", 401);
            }

            const count = await this._notificationService.markAllAsRead(userId);

            return ApiResponse.success(res, NOTIFICATION_MESSAGES.ALL_NOTIFICATIONS_MARKED_AS_READ, { count }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete notification
     * DELETE /api/notifications/:id
     */
    async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError("Unauthorized", 401);
            }

            const { id } = req.params;

            await this._notificationService.deleteNotification(id, userId);

            return ApiResponse.success(res, NOTIFICATION_MESSAGES.NOTIFICATION_DELETED, null, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete all read notifications
     * DELETE /api/notifications/delete-all-read
     */
    async deleteAllRead(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError("Unauthorized", 401);
            }

            const count = await this._notificationService.deleteAllRead(userId);

            return ApiResponse.success(res, NOTIFICATION_MESSAGES.ALL_READ_NOTIFICATIONS_DELETED, { count }, 200);
        } catch (error) {
            next(error);
        }
    }
}
