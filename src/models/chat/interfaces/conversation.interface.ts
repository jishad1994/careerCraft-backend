import { Types } from "mongoose";

export interface IchatParticipant {
    userId: Types.ObjectId;
    userType: "user" | "company";
    lastReadAt: Date;
    unreadCount: number;
}

export interface ILastMessage {
    content: string;
    senderId: Types.ObjectId;
    createdAt: Date;
    messageType: "text" | "file" | "system";
}
export interface IConversation {
    _id: Types.ObjectId;
    participants: IchatParticipant[];
    jobId?: Types.ObjectId;
    applicationId?: Types.ObjectId;
    lastMessage?: ILastMessage;
    initiatedBy: Types.ObjectId;
    status: "active" | "archived" | "blocked";
    createdAt: Date;
    updatedAt: Date;
}

export interface IConversationMethods {
    getOtherParticipant(currentUserId: string): { userId: Types.ObjectId; userType: string } | undefined;
    incrementUnreadCount(userId: string): Promise<void>;
    resetUnreadCount(userId: string): Promise<void>;
    updateLastMessage(message: ILastMessage): Promise<void>;
}
