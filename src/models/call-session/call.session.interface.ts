import mongoose from "mongoose";

export interface ICallParticipant {
    userId: string;
    role: "user" | "company";
    socketId: string;
    joinedAt: Date;
    leftAt?: Date;
    status: "waiting" | "connected" | "disconnected";
}

export interface ICallSession {
    _id?: mongoose.Types.ObjectId;
    interviewId: mongoose.Types.ObjectId;
    applicationId: mongoose.Types.ObjectId;
    roomId: string;
    participants: ICallParticipant[];
    callType: "video" | "audio";
    status: "waiting" | "active" | "ended";
    startedAt: Date;
    endedAt?: Date;
    duration?: number; // in seconds
    recordingUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISignalingMessage {
    type: "offer" | "answer" | "ice-candidate" | "join" | "leave";
    from: string;
    to?: string;
    roomId: string;
    data?: Record<string, string>;
}
