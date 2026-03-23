import { IAttachment, MessageType } from "../models/chat/interfaces/message.interface";

export interface SendMessageDTO {
    conversationId: string;
    senderId: string;
    senderType: 'user' | 'company';
    receiverId: string;
    receiverType: 'user' | 'company';
    content: string;
    messageType?: MessageType;
    attachments?: IAttachment[];
}
 
export interface CreateConversationDTO {
    participant1: { userId: string; userType: 'user' | 'company' };
    participant2: { userId: string; userType: 'user' | 'company' };
    initiatedBy: string;
    jobId?: string;
    applicationId?: string;
}