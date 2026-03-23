import { Model } from "mongoose";
import { IMessage, MessageStatus } from "../../../models/chat/interfaces/message.interface";
import { IMessageRepository } from "../interfaces/message.repository.interface";

export class MessageRepository implements IMessageRepository {


    constructor(private readonly model: Model<IMessage>) {}


    async create(data: Partial<IMessage>): Promise<IMessage> {
        return await this.model.create(data);
    }

    async findById(id: string): Promise<IMessage | null> {
        return await this.model.findById(id);
    }

    async findByConversation(conversationId: string, page: number = 1, limit: number = 50): Promise<IMessage[]> {
        return await this.model.find({
            conversationId,
            isDeleted: false,
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
    }

    async countByConversation(conversationId: string): Promise<number> {
        return await this.model.countDocuments({
            conversationId,
            isDeleted: false,
        });
    }

    async countUnread(conversationId: string, userId: string): Promise<number> {
        return await this.model.countDocuments({
            conversationId,
            receiverId: userId,
            status: { $ne: MessageStatus.READ },
            isDeleted: false,
        });
    }

    async markAsDelivered(messageIds: string[]): Promise<void> {
        await this.model.updateMany(
            {
                _id: { $in: messageIds },
                status: MessageStatus.SENT,
            },
            {
                $set: {
                    status: MessageStatus.DELIVERED,
                    deliveredAt: new Date(),
                },
            },
        );
    }

    async markAsRead(messageIds: string[], userId: string): Promise<void> {
        await this.model.updateMany(
            {
                _id: { $in: messageIds },
                receiverId: userId,
                status: { $ne: MessageStatus.READ },
            },
            {
                $set: {
                    status: MessageStatus.READ,
                    readAt: new Date(),
                },
                $addToSet: { readBy: userId },
            },
        );
    }

    async update(id: string, data: Partial<IMessage>): Promise<IMessage | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async softDelete(id: string): Promise<IMessage | null> {
        return await this.model.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            { new: true },
        );
    }

    async hardDelete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }
}
