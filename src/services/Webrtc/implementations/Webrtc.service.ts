// import { v4 as uuidv4 } from 'uuid';
import { IWebRTCService } from "../interfaces/Webrtc.service.interface";
import { ICallParticipant, ICallSession } from "../../../models/call-session/call.session.interface";
import { IWebRTCRepository } from "../../../repositories/webrtc/Webrtc.repository.interface";
import logger from "../../../utils/logger";
import mongoose from "mongoose";

export class WebRTCService implements IWebRTCService {
    constructor(private readonly repository: IWebRTCRepository) {}

    async createCallSession(
        interviewId: string,
        applicationId: string,
        callType: "video" | "audio",
    ): Promise<ICallSession> {
        logger.info("insdie creating call session");
        // Check if active session already exists
        const existingSession = await this.repository.findActiveSessionByInterview(interviewId);

        if (existingSession) {
            return existingSession;
        }

        // Generate unique room ID
        const roomId = `interview-${applicationId}-${interviewId}`;

        const sessionData: Partial<ICallSession> = {
            interviewId: new mongoose.Types.ObjectId(interviewId),
            applicationId: new mongoose.Types.ObjectId(applicationId),
            roomId,
            callType,
            status: "waiting",
            participants: [],

            startedAt: new Date(),
        };

        return await this.repository.createSession(sessionData);
    }

    async joinCall(
        applicaitonId: string,
        interviewId: string,
        roomId: string,
        userId: string,
        role: "user" | "company",
        socketId: string,
    ): Promise<ICallSession> {
        let session = await this.repository.findSessionByRoomId(roomId);

        if (!session) {
            session = await this.createCallSession(interviewId, applicaitonId, "video");
            
        }

        // Check if user already in session
        const existingParticipant = session.participants.find((p) => p.userId === userId);

        if (existingParticipant) {
            // Update socket ID if reconnecting
            await this.repository.updateParticipantStatus(roomId, userId, "connected");
            return (await this.repository.findSessionByRoomId(roomId)) as ICallSession;
        }

        // Add new participant
        const participant: ICallParticipant = {
            userId,
            role,
            socketId,
            joinedAt: new Date(),
            status: "connected",
        };

        const updatedSession = await this.repository.addParticipant(roomId, participant);

        if (!updatedSession) {
            throw new Error("Failed to join call");
        }

        // If both participants joined, set status to active
        const connectedCount = updatedSession.participants.filter((p) => p.status === "connected").length;

        if (connectedCount === 2 && updatedSession.status === "waiting") {
            await this.repository.updateSessionStatus(roomId, "active");
        }

        return (await this.repository.findSessionByRoomId(roomId)) as ICallSession;
    }

    async leaveCall(roomId: string, userId: string): Promise<ICallSession | null> {
        const session = await this.repository.findSessionByRoomId(roomId);

        if (!session) {
            return null;
        }

        // Mark participant as disconnected
        await this.repository.removeParticipant(roomId, userId);

        // Check if all participants left
        const updatedSession = await this.repository.findSessionByRoomId(roomId);

        if (updatedSession) {
            const connectedCount = updatedSession.participants.filter((p) => p.status === "connected").length;

            // If no one connected, end the session
            if (connectedCount === 0) {
                return await this.repository.endSession(roomId);
            }
        }

        return updatedSession;
    }

    async endCall(roomId: string): Promise<ICallSession | null> {
        return await this.repository.endSession(roomId);
    }

    async getActiveSession(interviewId: string): Promise<ICallSession | null> {
        return await this.repository.findActiveSessionByInterview(interviewId);
    }

    async getSessionByRoomId(roomId: string): Promise<ICallSession | null> {
        return await this.repository.findSessionByRoomId(roomId);
    }
}
