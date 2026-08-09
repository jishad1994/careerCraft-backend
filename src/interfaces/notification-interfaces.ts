import {  Types } from "mongoose";
import { NotificationPriority, NotificationType } from "../models/notifications/notification.interface";

export interface NotificationQueryParams {
    page?: string;
    limit?: string;
    unreadOnly?: string;
}

export interface CreateNotificationParams {
    userId: string;
    userModel?: "User" | "Company";
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    link?: string;
    metadata?: {
        applicationId?: Types.ObjectId;
        jobId?: Types.ObjectId;
        companyId?: Types.ObjectId;
        senderId?: Types.ObjectId;
        [key: string]: Types.ObjectId | string | number | boolean | undefined;
    };
}
