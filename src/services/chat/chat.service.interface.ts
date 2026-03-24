import { CreateConversationDTO, SendMessageDTO } from "../../dtos/chat.dto";
import { IConversation } from "../../models/chat/interfaces/conversation.interface";
import { IMessage } from "../../models/chat/interfaces/message.interface";
import { PaginationMeta } from "../../utils/apiResponse.utils";

export interface IChatService {
    createConversation(data: CreateConversationDTO): Promise<IConversation>;
    getOrCreateConversation(
        userId: string,
        companyId: string,
        initiatedBy: string,
        jobId?: string,
        applicationId?: string,
    ): Promise<IConversation>;
    getConversationById(id: string): Promise<IConversation | null>;
    getUserConversations(userId: string): Promise<IConversation[]>;
    getTotalUnreadCount(userId: string): Promise<number>;
    sendMessage(data: SendMessageDTO): Promise<IMessage>;
    getMessages(
        conversationId: string,
        page?: number,
        limit?: number,
    ): Promise<{ messages: IMessage[]; paginationMeta: PaginationMeta }>;
    markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
    markMessagesAsDelivered(messageIds: string[]): Promise<void>;
    editMessage(messageId: string, newContent: string): Promise<IMessage | null>;
    deleteMessage(messageId: string): Promise<boolean>;
    uploadAttachment(
        file: Express.Multer.File,
        folderName: string,
        conversationId: string,
    ): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string; s3Key: string }>;
}
