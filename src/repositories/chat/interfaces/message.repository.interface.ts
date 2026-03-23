import { IMessage } from "../../../models/chat/interfaces/message.interface";

export interface IMessageRepository {
    create(data: Partial<IMessage>): Promise<IMessage>;
    findById(id: string): Promise<IMessage | null>;
    findByConversation(conversationId: string, page?: number, limit?: number): Promise<IMessage[]>;
    countByConversation(conversationId: string): Promise<number>;
    countUnread(conversationId: string, userId: string): Promise<number>;
    markAsDelivered(messageIds: string[]): Promise<void>;
    markAsRead(messageIds: string[], userId: string): Promise<void>;
    update(id: string, data: Partial<IMessage>): Promise<IMessage | null>;
    softDelete(id: string): Promise<IMessage | null>;
    hardDelete(id: string): Promise<boolean>;
}