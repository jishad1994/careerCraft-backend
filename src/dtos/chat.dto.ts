import mongoose from "mongoose";
import { IAttachment, MessageType } from "../models/chat/interfaces/message.interface";

export interface SendMessageDTO {
    conversationId: string;
    senderId: string;
    senderType: "User" | "Company";
    receiverId: string;
    receiverType: "User" | "Company";
    content: string;
    messageType?: MessageType ;
    attachments?: IAttachment[];
}

export interface CreateConversationDTO {
    participant1: { userId: string; userType: "User" | "Company" };
    participant2: { userId: string; userType: "User" | "Company" };
    initiatedBy: string;
    jobId?: string;
    applicationId?: string;
}
export type PopulatedUser = {
    _id: mongoose.Types.ObjectId;
    firstName?: string;
    lastName?: string;
    name?: string;
    profilePicture?: {
        location?: string;
    };
};

export type PopulatedParticipant = {
    userId: PopulatedUser | mongoose.Types.ObjectId;
    userType: "User" | "Company";
    lastReadAt: Date;
    unreadCount: number;
};

export type PopulatedConversation = {
    _id: mongoose.Types.ObjectId;
    jobId?: mongoose.Types.ObjectId;
    applicationId?: mongoose.Types.ObjectId;
    initiatedBy: mongoose.Types.ObjectId;
    status: "active" | "archived" | "blocked";
    createdAt: Date;
    updatedAt: Date;
    lastMessage?: {
        content: string;
        senderId: mongoose.Types.ObjectId;
        createdAt: Date;
        messageType: "text" | "file" | "system";
    };
    participants: PopulatedParticipant[];
};

export interface Conversation {
    _id: string;
    participants: Participant[];
    jobId?: string;
    applicationId?: string;
    lastMessage?: LastMessage;
    initiatedBy: string;
    status: "active" | "archived" | "blocked";
    createdAt: string;
    updatedAt: string;
}
export interface Participant {
    userId: string;
    userType: "User" | "Company";
    lastReadAt: string;
    unreadCount: number;
    participantName?: string;
    participantAvatar?: string;
}

export interface LastMessage {
    content: string;
    senderId: string;
    createdAt: string;
    messageType: "text" | "file" | "system";
}
