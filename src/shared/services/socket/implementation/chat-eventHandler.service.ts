import { Server, Socket } from "socket.io";
import { IChatService } from "../../../../services/chat/chat.service.interface";
import { IChatEventHandler } from "../interface/chat-eventHandler.interface";
import { IUserSocketMapService } from "../interface/socket-map.service.interface";
import { IMessage, MessageType } from "../../../../models/chat/interfaces/message.interface";
import logger from "../../../../utils/logger";

export class ChatEventHandler implements IChatEventHandler {
    constructor(private readonly _chatService: IChatService, private readonly _userSocketMap: IUserSocketMapService) {}

    /**
     * Register all chat-related socket events
     */
    register(socket: Socket, io: Server): void {
        // Join conversation room
        socket.on("chat:join", async (data: { conversationId: string }) => {
            await this.handleJoinConversation(socket, data);
        });

        // Leave conversation room
        socket.on("chat:leave", async (data: { conversationId: string }) => {
            await this.handleLeaveConversation(socket, data);
        });

        // Send message
        socket.on("chat:sendMessage", async (data: IMessage) => {

            await this.handleSendMessage(socket, io, data);
        });

        // Typing indicators
        socket.on("chat:typing:start", (data: { conversationId: string; receiverId: string }) => {
            this.handleTypingStart(socket, io, data);
        });

        socket.on("chat:typing:stop", (data: { conversationId: string; receiverId: string }) => {
            this.handleTypingStop(socket, io, data);
        });

        // Read receipts
        socket.on("chat:markAsRead", async (data: { conversationId: string; messageIds: string[] }) => {
            await this.handleMarkAsRead(socket, io, data);
        });

        // Delivery receipts
        socket.on("chat:markAsDelivered", async (data: { messageIds: string[] }) => {
            await this.handleMarkAsDelivered(socket, io, data);
        });

        logger.info(`Chat events registered for socket: ${socket.id}`);
    }

    /**
     * Handle joining a conversation room
     */
    async handleJoinConversation(socket: Socket, data: { conversationId: string }): Promise<void> {
        try {
            const { conversationId } = data;
            const userId = socket.data.userId;

            // Verify user is participant
            const conversation = await this._chatService.getConversationById(conversationId);
            if (!conversation) {
                socket.emit("error", { message: "Conversation not found" });
                return;
            }

            const isParticipant = conversation.participants.some((p) => p.userId.toString() === userId);

            if (!isParticipant) {
                socket.emit("error", { message: "Not authorized to join this conversation" });
                return;
            }

            // Join room
            const roomName = `conversation:${conversationId}`;
            socket.join(roomName);

            logger.info(`User ${userId} joined conversation ${conversationId}`);

            // Mark messages as delivered
            const { messages } = await this._chatService.getMessages(conversationId, 1, 100);
            const undeliveredIds = messages
                .filter((msg: IMessage) => msg.receiverId.toString() === userId && msg.status === "sent")
                .map((msg: IMessage) => msg._id.toString());

            if (undeliveredIds.length > 0) {
                await this._chatService.markMessagesAsDelivered(undeliveredIds);

                // Notify sender about delivery
                const senderId = messages[0]?.senderId.toString();
                if (senderId) {
                    socket.to(`user:${senderId}`).emit("chat:messagesDelivered", {
                        conversationId,
                        messageIds: undeliveredIds,
                    });
                }
            }

            socket.emit("chat:joined", {
                conversationId,
                success: true,
            });
        } catch (error) {
            logger.error("Error joining conversation:", error);
            socket.emit("error", { message: "Failed to join conversation" });
        }
    }

    /**
     * Handle leaving a conversation room
     */
    async handleLeaveConversation(socket: Socket, data: { conversationId: string }): Promise<void> {
        try {
            const { conversationId } = data;
            const roomName = `conversation:${conversationId}`;
            socket.leave(roomName);

            logger.info(`User ${socket.data.userId} left conversation ${conversationId}`);

            socket.emit("chat:left", {
                conversationId,
                success: true,
            });
        } catch (error) {
            logger.error("Error leaving conversation:", error);
        }
    }

    /**
     * Handle sending a message
     */
    async handleSendMessage(socket: Socket, io: Server, data: IMessage): Promise<void> {
        try {
            const { conversationId, content, messageType, attachments } = data;
            const userId = socket.data.userId;
            const userType = socket.data.role === "user" ? "User" : "Company";

            // Get conversation to find receiver
            const conversation = await this._chatService.getConversationById(conversationId.toString());

        
            if (!conversation) {
                socket.emit("error", { message: "Conversation not found" });
                return;
            }
            const otherParticipant = conversation.participants.find(
                (participant) => participant.userId.toString() != userId,
            );

            // const otherParticipant = this._conversationRepository.getOtherParticipant(userId);
            if (!otherParticipant) {
                socket.emit("error", { message: "Receiver not found" });
                return;
            }

            // Send message
            const message = await this._chatService.sendMessage({
                conversationId: conversationId.toString(),
                senderId: userId,
                senderType: userType,
                receiverId: otherParticipant.userId.toString(),
                receiverType: otherParticipant.userType as "User" | "Company",
                content,
                messageType: messageType || MessageType.TEXT,
                attachments: attachments || [],
            });

            // Emit to conversation room
            io.to(`conversation:${conversationId}`).emit("chat:newMessage", message);

            // Emit to receiver's personal room (if they're online but not in conversation)
            io.to(`user:${otherParticipant.userId}`).emit("chat:messageNotification", {
                conversationId,
                message,
            });

            // Get updated unread count for receiver
            const unreadCount = await this._chatService.getTotalUnreadCount(otherParticipant.userId.toString());

            io.to(`user:${otherParticipant.userId}`).emit("chat:unreadCount", {
                count: unreadCount,
            });

            logger.info(`Message sent in conversation ${conversationId}`);
        } catch (error) {
            logger.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send the new message" });
        }
    }

    /**
     * Handle typing start
     */
    handleTypingStart(socket: Socket, io: Server, data: { conversationId: string; receiverId: string }): void {
        const { conversationId, receiverId } = data;
        const senderId = socket.data.userId;

        // Emit to receiver only
        io.to(`user:${receiverId}`).emit("chat:typing", {
            conversationId,
            userId: senderId,
            isTyping: true,
        });

        logger.info(`User ${senderId} started typing in conversation ${conversationId}`);
    }

    /**
     * Handle typing stop
     */
    handleTypingStop(socket: Socket, io: Server, data: { conversationId: string; receiverId: string }): void {
        const { conversationId, receiverId } = data;
        const senderId = socket.data.userId;

        // Emit to receiver only
        io.to(`user:${receiverId}`).emit("chat:typing", {
            conversationId,
            userId: senderId,
            isTyping: false,
        });

        logger.info(`User ${senderId} stopped typing in conversation ${conversationId}`);
    }

    /**
     * Handle mark messages as read
     */
    async handleMarkAsRead(
        socket: Socket,
        io: Server,
        data: { conversationId: string; messageIds: string[] },
    ): Promise<void> {
        try {
            const { conversationId, messageIds } = data;
            const userId = socket.data.userId;

            // Mark messages as read
            await this._chatService.markMessagesAsRead(conversationId, userId);

            // Notify sender about read receipts
            const conversation = await this._chatService.getConversationById(conversationId);
            if (conversation) {
                const otherParticipant = conversation.participants.find(
                    (participant) => participant.userId.toString() != userId,
                );
                // const otherParticipant = conversation.getOtherParticipant(userId);
                if (otherParticipant) {
                    io.to(`user:${otherParticipant.userId}`).emit("chat:messagesRead", {
                        conversationId,
                        messageIds,
                        readBy: userId,
                    });
                }
            }

            // Update unread count
            const unreadCount = await this._chatService.getTotalUnreadCount(userId);
            socket.emit("chat:unreadCount", { count: unreadCount });

            logger.info(`Messages marked as read in conversation ${conversationId}`);
        } catch (error) {
            logger.error("Error marking messages as read:", error);
        }
    }

    /**
     * Handle mark messages as delivered
     */
    async handleMarkAsDelivered(socket: Socket, io: Server, data: { messageIds: string[] }): Promise<void> {
        try {
            const { messageIds } = data;

            await this._chatService.markMessagesAsDelivered(messageIds);

            logger.info(`Messages marked as delivered: ${messageIds.length}`);
        } catch (error) {
            logger.error("Error marking messages as delivered:", error);
        }
    }
}
