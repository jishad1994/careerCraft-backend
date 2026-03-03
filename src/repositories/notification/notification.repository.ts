import mongoose, { FilterQuery, Model } from "mongoose";
import { INotification } from "../../models/notifications/notification.interface";
import { BaseRepository } from "../base-repository/base.repository";
import { INotificationRepository } from "./notification.repository.interface";

export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
    constructor(protected readonly model: Model<INotification>) {
        super(model);
    }

    async getNotificationsPaginated(
        userId: string,
        page: number,
        limit: number,
        unreadOnly: boolean,
    ): Promise<[notifications: INotification[], total: number]> {
        const skip = (page - 1) * limit;

        const query: FilterQuery<INotification> = {
            userId: new mongoose.Types.ObjectId(userId),
        };

        if (unreadOnly) {
            query.isRead = false;
        }

        const [notifications, total] = await Promise.all([
            this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.model.countDocuments(query),
        ]);
        return [notifications, total];
    }

    async deleteNotification(filter: Partial<INotification>): Promise<{ deletedCount: number }> {
        const result = await this.model.deleteMany(filter as FilterQuery<INotification>);

        return { deletedCount: result.deletedCount || 0 };
    }

    async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
        return await this.model.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(notificationId), userId: new mongoose.Types.ObjectId(userId) },
            { $set: { isRead: true, readAt: new Date() } },
            { new: true },
        );
    }

    async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
        const result = await this.model.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), isRead: false },
            { $set: { isRead: true, readAt: new Date() } },
        );
        return { modifiedCount: result.modifiedCount || 0 };
    }

    async countByUserId(userId: string, unreadOnly: boolean): Promise<number> {
        const query: FilterQuery<INotification> = {
            userId: new mongoose.Types.ObjectId(userId),
        };

        if (unreadOnly) {
            query.isRead = false;
        }

        return await this.model.countDocuments(query);
    }
}
