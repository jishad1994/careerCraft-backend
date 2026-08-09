import { ICallSession } from "../../../models/call-session/call.session.interface";

export interface IWebRTCService {
    createCallSession(interviewId: string, applicationId: string, callType: "video" | "audio"): Promise<ICallSession>;
    joinCall(applicationId:string,interviewId:string,roomId: string, userId: string, role: "user" | "company", socketId: string): Promise<ICallSession>;
    leaveCall(roomId: string, userId: string): Promise<ICallSession | null>;
    endCall(roomId: string): Promise<ICallSession | null>;
    getActiveSession(interviewId: string): Promise<ICallSession | null>;
    getSessionByRoomId(roomId: string): Promise<ICallSession | null>;
}
