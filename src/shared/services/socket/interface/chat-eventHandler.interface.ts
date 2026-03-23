import { Server, Socket } from "socket.io";
import { IMessage } from "../../../../models/chat/interfaces/message.interface";

export interface IChatEventHandler {
    register(socket: Socket, io: Server): void;
    handleJoinConversation(socket: Socket, data: { conversationId: string }): Promise<void>;
    handleLeaveConversation(socket: Socket, data: { conversationId: string }): Promise<void>;
    handleSendMessage(socket: Socket, io: Server, data: IMessage): Promise<void>;
    handleTypingStart(socket: Socket, io: Server, data: { conversationId: string; receiverId: string }): void;
    handleTypingStop(socket: Socket, io: Server, data: { conversationId: string; receiverId: string }): void;
    handleMarkAsRead(socket: Socket, io: Server, data: { conversationId: string; messageIds: string[] }): Promise<void>;
    handleMarkAsDelivered(socket: Socket, io: Server, data: { messageIds: string[] }): Promise<void>;
}
