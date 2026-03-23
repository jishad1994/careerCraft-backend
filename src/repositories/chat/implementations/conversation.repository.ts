import mongoose, { FilterQuery, Model } from "mongoose";
import { IConversation, ILastMessage } from "../../../models/chat/interfaces/conversation.interface";
import { IConversationRepository } from "../interfaces/conversation.repository.interface";

export class ConversationRepository implements IConversationRepository {
    constructor(private readonly model: Model<IConversation>) {}
    async create(data: Partial<IConversation>): Promise<IConversation> {
        return this.model.create(data);
    }

    async findById(id: string): Promise<IConversation | null> {
        return await this.model.findById(id);
    }

    async findByParticipants(userId1: string, userId2: string, jobId?: string): Promise<IConversation | null> {
        const query: FilterQuery<IConversation> = {
            participants: {
                $all: [{ $elemMatch: { userId: userId1 } }, { $elemMatch: { userId: userId2 } }],
            },
        };

        if (jobId) {
            query.jobId = jobId;
        } else {
            query.jobId = { $exists: false };
        }

        return await this.model.findOne(query);
    }

    async findByUserId(userId: string, status: string = "active"): Promise<IConversation[]> {
        return await this.model
            .find({
                "participants.userId": userId,
                status,
            })
            .sort({ updatedAt: -1 });
    }

    async update(id: string, data: Partial<IConversation>): Promise<IConversation | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async updateLastMessage(conversationId: string, message: ILastMessage): Promise<void> {
        await this.model.updateOne(
            { _id: conversationId },
            {
                $set: { lastMessage: message },
                $currentDate: { updatedAt: true },
            },
        );
    }

    async incrementUnreadCount(conversationId: string, userId: string): Promise<void> {
        await this.model.updateOne(
            {
                _id: conversationId,
                "participants.userId": userId,
            },
            {
                $inc: { "participants.$.unreadCount": 1 },
            },
        );
    }

    async resetUnreadCount(conversationId: string, userId: string): Promise<void> {
        await this.model.updateOne(
            {
                _id: conversationId,
                "participants.userId": userId,
            },
            {
                $set: {
                    "participants.$.unreadCount": 0,
                    "participants.$.lastReadAt": new Date(),
                },
            },
        );
    }

    async getTotalUnreadCount(userId: string): Promise<number> {
        const result = await this.model.aggregate([
            {
                $match: {
                    "participants.userId": new mongoose.Types.ObjectId(userId),
                    status: "active",
                },
            },
            { $unwind: "$participants" },
            {
                $match: {
                    "participants.userId": new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$participants.unreadCount" },
                },
            },
        ]);

        return result[0]?.total || 0;
    }

    async archive(id: string): Promise<IConversation | null> {
        return await this.update(id, { status: "archived" });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }
}
