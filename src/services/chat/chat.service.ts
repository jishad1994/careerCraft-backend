import { Types } from "mongoose";
import { CreateConversationDTO, SendMessageDTO } from "../../dtos/chat.dto";
import { IConversation } from "../../models/chat/interfaces/conversation.interface";
import { IConversationRepository } from "../../repositories/chat/interfaces/conversation.repository.interface";
import { IMessageRepository } from "../../repositories/chat/interfaces/message.repository.interface";
import { IFileService } from "../file-service/interfaces/file.service.interface";
import { INotificationService } from "../notification/interface/notification.service.interface";
import { IChatService } from "./chat.service.interface";
import { IMessage, MessageStatus, MessageType } from "../../models/chat/interfaces/message.interface";
import { ValidationError } from "../../errors-classes/validation.error";
import { getFileLocation } from "../../utils/s3-bucket.utils";
import { PaginationMeta } from "../../utils/apiResponse.utils";

export class ChatService implements IChatService {
    constructor(
        private readonly _conversationRepository: IConversationRepository,
        private readonly _messageRepository: IMessageRepository,
        private readonly _fileService: IFileService,
        private readonly _notificationService: INotificationService,
    ) {}

    async createConversation(data: CreateConversationDTO): Promise<IConversation> {
        const existing = await this._conversationRepository.findByParticipants(
            data.participant1.userId,
            data.participant2.userId,
            data.jobId,
        );

        if (existing) return existing;

        return await this._conversationRepository.create({
            participants: [
                {
                    userId: new Types.ObjectId(data.participant1.userId),
                    userType: data.participant1.userType,
                    lastReadAt: new Date(),
                    unreadCount: 0,
                },
                {
                    userId: new Types.ObjectId(data.participant2.userId),
                    userType: data.participant2.userType,
                    lastReadAt: new Date(),
                    unreadCount: 0,
                },
            ],
            initiatedBy: new Types.ObjectId(data.initiatedBy),
            jobId: data.jobId ? new Types.ObjectId(data.jobId) : undefined,
            applicationId: data.applicationId ? new Types.ObjectId(data.applicationId) : undefined,
            status: "active",
        });
    }

    async getOrCreateConversation(
        userId: string,
        companyId: string,
        initiatedBy: string,
        jobId?: string,
        applicationId?: string,
    ): Promise<IConversation> {
        const existing = await this._conversationRepository.findByParticipants(userId, companyId, jobId);
        if (existing) return existing;

        return await this.createConversation({
            participant1: { userId, userType: "user" },
            participant2: { userId: companyId, userType: "company" },
            initiatedBy,
            jobId,
            applicationId,
        });
    }

    async getConversationById(id: string): Promise<IConversation | null> {
        return await this._conversationRepository.findById(id);
    }

    async getUserConversations(userId: string): Promise<IConversation[]> {
        return await this._conversationRepository.findByUserId(userId, "active");
    }

    async getTotalUnreadCount(userId: string): Promise<number> {
        return await this._conversationRepository.getTotalUnreadCount(userId);
    }

    async sendMessage(data: SendMessageDTO): Promise<IMessage> {
        const conversation = await this._conversationRepository.findById(data.conversationId);
        if (!conversation) {
            throw new ValidationError("Conversation not found", 404);
        }

        const isParticipant = conversation.participants.some((p) => p.userId.toString() === data.senderId);
        if (!isParticipant) {
            throw new ValidationError("Sender is not a participant", 403);
        }

        const message = await this._messageRepository.create({
            conversationId: new Types.ObjectId(data.conversationId),
            senderId: new Types.ObjectId(data.senderId),
            senderType: data.senderType,
            receiverId: new Types.ObjectId(data.receiverId),
            receiverType: data.receiverType,
            content: data.content,
            messageType: data.messageType || MessageType.TEXT,
            attachments: data.attachments || [],
            status: MessageStatus.SENT,
        });

        await this._conversationRepository.updateLastMessage(data.conversationId, message);
        await this._conversationRepository.incrementUnreadCount(data.conversationId, data.receiverId);

        await this._notificationService.createNotification({
            userId: data.receiverId.toString(),
            type: "message",
            title: "New Message",
            message: data.content.substring(0, 50),
            metadata: {
                conversationId: data.conversationId,
                messageId: message._id.toString(),
                senderId: new Types.ObjectId(data.senderId),
            },
        });

        return message;
    }

    async getMessages(
        conversationId: string,
        page: number = 1,
        limit: number = 50,
    ): Promise<{ messages: IMessage[]; paginationMeta: PaginationMeta }> {
        const [messages, total] = await this._messageRepository.findByConversation(conversationId, page, limit);

        const totalPages = Math.ceil(total / limit);
        const paginationMeta: PaginationMeta = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return { messages, paginationMeta };
    }

    async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
        const [messages] = await this._messageRepository.findByConversation(conversationId);
        const unreadMessageIds = messages
            .filter((msg: IMessage) => msg.receiverId.toString() === userId && msg.status !== "read")
            .map((msg: IMessage) => msg._id.toString());

        if (unreadMessageIds.length > 0) {
            await this._messageRepository.markAsRead(unreadMessageIds, userId);
        }

        await this._conversationRepository.resetUnreadCount(conversationId, userId);
    }

    async markMessagesAsDelivered(messageIds: string[]): Promise<void> {
        await this._messageRepository.markAsDelivered(messageIds);
    }

    async editMessage(messageId: string, newContent: string): Promise<IMessage | null> {
        return await this._messageRepository.update(messageId, {
            content: newContent,
            isEdited: true,
        });
    }

    async deleteMessage(messageId: string): Promise<boolean> {
        const result = await this._messageRepository.softDelete(messageId);
        return !!result;
    }

    async uploadAttachment(
        file: Express.Multer.File,
        folderName: string,
        conversationId: string,
    ): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string; s3Key: string }> {
        const fileKey = await this._fileService.uplodaFile(file, folderName, conversationId);

        return {
            fileUrl: getFileLocation(fileKey),
            fileName: file.filename,
            fileSize: file.size,
            fileType: file.mimetype,
            s3Key: fileKey,
        };
    }
}
