import { PopulatedConversation } from "../../../dtos/chat.dto";
import { IConversation, ILastMessage } from "../../../models/chat/interfaces/conversation.interface";

export interface IConversationRepository {
    create(data: Partial<IConversation>): Promise<PopulatedConversation>;
    findById(id: string): Promise<PopulatedConversation | null>;
    findByParticipants(userId1: string, userId2: string, jobId?: string): Promise<PopulatedConversation | null>;
    findByUserId(userId: string, status?: string): Promise<PopulatedConversation[]>;
    update(id: string, data: Partial<IConversation>): Promise<IConversation | null>;
    updateLastMessage(conversationId: string, message: ILastMessage): Promise<void>;
    incrementUnreadCount(conversationId: string, userId: string): Promise<void>;
    resetUnreadCount(conversationId: string, userId: string): Promise<void>;
    getTotalUnreadCount(userId: string): Promise<number>;
    archive(id: string): Promise<IConversation | null>;
    delete(id: string): Promise<boolean>;
}