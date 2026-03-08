import { Server, Socket } from "socket.io";
import { IWebRTCService } from "../interfaces/Webrtc.service.interface";
import { IWebRTCEventHandler } from "../interfaces/Webrtc.event-handler.service.interface";
import logger from "../../../utils/logger";

export class WebRTCEventHandler implements IWebRTCEventHandler {
    constructor(private readonly webrtcService: IWebRTCService) {}

    async register(socket: Socket, io: Server) {
        socket.on(
            "join-interview",
            async (data: {
                applicationId: string;
                interviewId: string;
                roomId: string;
                userId: string;
                role: "user" | "company";
            }) => {
                try {
                    const { roomId, applicationId, interviewId } = data;

                    const userId = socket.data.userId;
                    const role = socket.data.role;
                    socket.join(roomId);

                    const session = await this.webrtcService.joinCall(
                        applicationId,
                        interviewId,
                        roomId,
                        userId,
                        role,
                        socket.id,
                    );

                    const connectedParticipants = session.participants.filter(
                        (p) => p.status === "connected" && p.userId !== userId,
                    );

                    socket.emit("joined-interview", {
                        roomId,
                        session,
                        shouldInitiate: connectedParticipants.length === 0,
                        existingParticipants: connectedParticipants,
                    });

                    logger.info("user joined on the interview room", roomId);

                    socket.to(roomId).emit("user-joined", {
                        userId,
                        role,
                        socketId: socket.id,
                    });
                } catch (error) {
                    socket.emit("error", {
                        message: error instanceof Error ? error?.message : "socket error while joining interview",
                    });
                }
            },
        );

        // Request to initiate connection (for late joiners)
        socket.on("request-connection", (data: { roomId: string; to: string }) => {
            logger.info(`Connection requested from ${socket.id} to ${data.to}`);
            socket.to(data.to).emit("connection-requested", {
                from: socket.id,
                roomId: data.roomId,
            });
        });

        socket.on("webrtc-offer", (data: { roomId: string; offer: RTCSessionDescriptionInit; to: string }) => {
            logger.info(`Relaying offer from ${socket.id} to ${data.to}`);
            socket.to(data.to).emit("webrtc-offer", {
                offer: data.offer,
                from: socket.id,
            });
        });

        socket.on("webrtc-answer", (data: { roomId: string; answer: RTCSessionDescriptionInit; to: string }) => {
            logger.info(`Relaying answer from ${socket.id} to ${data.to}`);
            socket.to(data.to).emit("webrtc-answer", {
                answer: data.answer,
                from: socket.id,
            });
        });

        socket.on("ice-candidate", (data: { roomId: string; candidate: RTCIceCandidateInit; to: string }) => {
            socket.to(data.to).emit("ice-candidate", {
                candidate: data.candidate,
                from: socket.id,
            });
        });

        // Leave interview
        socket.on("leave-interview", async (data: { roomId: string; userId: string }) => {
            try {
                const { roomId } = data;
                const userId = socket.data.userId;
                await this.webrtcService.leaveCall(roomId, userId);

                socket.to(roomId).emit("user-left", { userId, socketId: socket.id });
                socket.leave(roomId);

                logger.info(`User ${userId} left room ${roomId}`);
            } catch (error) {
                logger.error("Error leaving interview:", error);
            }
        });

        // End interview (host only)
        socket.on("end-interview", async (data: { roomId: string }) => {
            try {
                const { roomId } = data;

                await this.webrtcService.endCall(roomId);

                io.to(roomId).emit("interview-ended");

                logger.info(`Interview ended: ${roomId}`);
            } catch (error) {
                logger.error("Error ending interview:", error);
            }
        });
    }
}
