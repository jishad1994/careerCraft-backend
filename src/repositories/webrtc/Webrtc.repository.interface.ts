import { ICallParticipant, ICallSession } from "../../models/call-session/call.session.interface";

export interface IWebRTCRepository {
    createSession(sessionData: Partial<ICallSession>): Promise<ICallSession>;
    findSessionByRoomId(roomId: string): Promise<ICallSession | null>;
    findActiveSessionByInterview(interviewId: string): Promise<ICallSession | null>;
    addParticipant(roomId: string, participant: ICallParticipant): Promise<ICallSession | null>;
    removeParticipant(roomId: string, userId: string): Promise<ICallSession | null>;
    updateParticipantStatus(roomId: string, userId: string, status: string): Promise<ICallSession | null>;
    endSession(roomId: string): Promise<ICallSession | null>;
    updateSessionStatus(roomId: string, status: string): Promise<ICallSession | null>;
}
