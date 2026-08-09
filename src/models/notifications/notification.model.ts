import mongoose, { Model, Schema } from "mongoose";
import { INotification, NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "./notification.interface";

export const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            refPath: "userModel",
            required: true,
            index: true,
        },
        userModel: {
            type: String,
            required: true,
            enum: ["User", "Company"],
            default: "User",
        },
        type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPES),
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        priority: {
            type: String,
            enum: Object.values(NOTIFICATION_PRIORITIES),
            default: NOTIFICATION_PRIORITIES.MEDIUM,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        link: {
            type: String,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

notificationSchema.index(
    { readAt: 1 },
    {
        expireAfterSeconds: 30 * 24 * 60 * 60,
        partialFilterExpression: { isRead: true },
    },
);

export const Notification: Model<INotification> = mongoose.model<INotification>("Notification", notificationSchema);
