// Backend: src/repositories/webrtc/webrtc.repository.ts

import { Model } from "mongoose";
import { IWebRTCRepository } from "./Webrtc.repository.interface";
import { ICallParticipant, ICallSession } from "../../models/call-session/call.session.interface";

export class WebRTCRepository implements IWebRTCRepository {
    constructor(private readonly model: Model<ICallSession>) {}

    async createSession(sessionData: Partial<ICallSession>): Promise<ICallSession> {
        const session = new this.model(sessionData);
        return await session.save();
    }

    async findSessionByRoomId(roomId: string): Promise<ICallSession | null> {
        return await this.model.findOne({ roomId }).lean();
    }

    async findActiveSessionByInterview(interviewId: string): Promise<ICallSession | null> {
        return await this.model
            .findOne({
                interviewId,
                status: { $in: ["waiting", "active"] },
            })
            .lean();
    }

    async addParticipant(roomId: string, participant: ICallParticipant): Promise<ICallSession | null> {
        return await this.model
            .findOneAndUpdate(
                { roomId },
                {
                    $push: { participants: participant },
                },
                { new: true },
            )
            .lean();
    }

    async removeParticipant(roomId: string, userId: string): Promise<ICallSession | null> {
        return await this.model
            .findOneAndUpdate(
                { roomId, "participants.userId": userId },
                {
                    $set: {
                        "participants.$.leftAt": new Date(),
                        "participants.$.status": "disconnected",
                    },
                },
                { new: true },
            )
            .lean();
    }

    async updateParticipantStatus(roomId: string, userId: string, status: string): Promise<ICallSession | null> {
        return await this.model
            .findOneAndUpdate(
                { roomId, "participants.userId": userId },
                {
                    $set: {
                        "participants.$.status": status,
                    },
                },
                { new: true },
            )
            .lean();
    }

    async endSession(roomId: string): Promise<ICallSession | null> {
        return await this.model
            .findOneAndUpdate(
                { roomId },
                {
                    $set: {
                        status: "ended",
                        endedAt: new Date(),
                    },
                },
                { new: true },
            )
            .lean();
    }

    async updateSessionStatus(roomId: string, status: string): Promise<ICallSession | null> {
        const update: Record<string, unknown> = { status };

        if (status === "active") {
            update.startedAt = new Date();
        } else if (status === "ended") {
            update.endedAt = new Date();
        }

        return await this.model.findOneAndUpdate({ roomId }, { $set: update }, { new: true }).lean();
    }
}
