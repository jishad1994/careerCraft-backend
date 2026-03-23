import { Types } from "mongoose";

export enum MessageType {
    TEXT = 'text',
    FILE = 'file',
    SYSTEM = 'system',
}

export enum MessageStatus {
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
}

export interface IAttachment {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    s3Key: string;
}

export interface IMessage {
    _id: Types.ObjectId;
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderType: 'user' | 'company';
    receiverId: Types.ObjectId;
    receiverType: 'user' | 'company';
    content: string;
    messageType: MessageType;
    attachments: IAttachment[];
    status: MessageStatus;
    readBy: Types.ObjectId[];
    deliveredAt?: Date;
    readAt?: Date;
    isEdited: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}