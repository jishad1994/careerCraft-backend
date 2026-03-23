import { IConversation, ILastMessage } from "../../../models/chat/interfaces/conversation.interface";

export interface IConversationRepository {
    create(data: Partial<IConversation>): Promise<IConversation>;
    findById(id: string): Promise<IConversation | null>;
    findByParticipants(userId1: string, userId2: string, jobId?: string): Promise<IConversation | null>;
    findByUserId(userId: string, status?: string): Promise<IConversation[]>;
    update(id: string, data: Partial<IConversation>): Promise<IConversation | null>;
    updateLastMessage(conversationId: string, message: ILastMessage): Promise<void>;
    incrementUnreadCount(conversationId: string, userId: string): Promise<void>;
    resetUnreadCount(conversationId: string, userId: string): Promise<void>;
    getTotalUnreadCount(userId: string): Promise<number>;
    archive(id: string): Promise<IConversation | null>;
    delete(id: string): Promise<boolean>;
}