import mongoose, { Document, Types } from "mongoose";
export const NOTIFICATION_TYPES = {
    APPLICATION_STATUS: "application_status",
    NEW_APPLICATION: "new_application",
    INTERVIEW_SCHEDULED: "interview_scheduled",
    MESSAGE: "message",
    JOB_POSTED: "job_posted",
    APPLICATION_VIEWED: "application_viewed",
    PROFILE_VIEWED: "profile_viewed",
    SYSTEM: "system",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_PRIORITIES = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    URGENT: "urgent",
} as const;

export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[keyof typeof NOTIFICATION_PRIORITIES];

export interface INotification extends Document<mongoose.Types.ObjectId> {
    userId: Types.ObjectId;
    userModel: "User" | "Company";
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    isRead: boolean;
    link?: string;
    metadata?: {
        applicationId?: Types.ObjectId;
        jobId?: Types.ObjectId;
        companyId?: Types.ObjectId;
        senderId?: Types.ObjectId;
        [key: string]: Types.ObjectId | string | number | boolean | undefined;
    };
    createdAt: Date;
    readAt?: Date;
    updatedAt: Date;
}
