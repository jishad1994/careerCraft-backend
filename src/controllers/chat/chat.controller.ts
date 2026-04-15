import { NextFunction, Request, Response } from "express";
import { IChatService } from "../../services/chat/chat.service.interface";
import { IChatController } from "./chat.controller.interface";
import { AuthError } from "../../errors-classes/auth.error";
import { HTTP_MESSAGES } from "../../constants/messages/http.messages.constants";
import { ApiResponse } from "../../utils/apiResponse.utils";
import { ValidationError } from "../../errors-classes/validation.error";
import { MessageType } from "../../models/chat/interfaces/message.interface";
import { CHAT_MESSAGES } from "../../constants/messages/chat.messages.constants";
import { USER_ROLES } from "../../interfaces/auth.interface";

export class ChatController implements IChatController {
    constructor(private readonly _chatService: IChatService) {}

    async getConversations(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            console.log("user role:", req.user?.role);
            console.log("user id:", req.user?.id);
            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }
            const conversations = await this._chatService.getUserConversations(userId);

            return ApiResponse.success(res, CHAT_MESSAGES.CONVERSATION_FETCH_SUCCESS, conversations);
        } catch (error) {
            next(error);
        }
    }

    async createConversation(req: Request, res: Response, next: NextFunction) {
        try {
            const { otherUserId, jobId, applicationId } = req.body;

            const currentUserId = req.user?.id;
            const currentUserRole = req.user?.role;

            if (!currentUserId || !currentUserRole) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const isCompany = currentUserRole === USER_ROLES.COMPANY;

            const userId = isCompany ? otherUserId : currentUserId;
            const companyId = isCompany ? currentUserId : otherUserId;

            const conversation = await this._chatService.getOrCreateConversation(
                userId,
                companyId,
                currentUserId,
                jobId,
                applicationId,
            );

            return ApiResponse.success(res, CHAT_MESSAGES.CONVERSATION_CREATED_SUCCESSFULLY, conversation);
        } catch (error) {
            next(error);
        }
    }

    async getConversationById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const conversation = await this._chatService.getConversationById(id);

            if (!conversation) {
                throw new ValidationError(CHAT_MESSAGES.CONVERSATION_NOT_FOUND, 404);
            }

            const isParticipant = conversation.participants.some((p) => p.userId.toString() === userId);

            if (!isParticipant) {
                throw new AuthError(HTTP_MESSAGES.FORBIDDEN, 403);
            }

            return ApiResponse.success(res, CHAT_MESSAGES.CONVERSATION_FETCH_SUCCESS, conversation);
        } catch (error) {
            next(error);
        }
    }

    async getMessages(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const userId = req.user?.id;

            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const conversation = await this._chatService.getConversationById(id);

            if (!conversation) {
                throw new ValidationError(CHAT_MESSAGES.CONVERSATION_NOT_FOUND, 404);
            }

            const isParticipant = conversation.participants.some((p) => p.userId.toString() === userId);

            if (!isParticipant) {
                throw new AuthError(HTTP_MESSAGES.FORBIDDEN, 403);
            }

            const { messages, paginationMeta } = await this._chatService.getMessages(id, page, limit);

            return ApiResponse.success(res, CHAT_MESSAGES.MESSAGES_FETCHED_SUCCESSFULLY, messages, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: conversationId } = req.params;
            const { content, messageType } = req.body;

            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const conversation = await this._chatService.getConversationById(conversationId);

            if (!conversation) {
                throw new ValidationError(CHAT_MESSAGES.CONVERSATION_NOT_FOUND, 404);
            }

            const otherParticipant = conversation.participants.find(
                (participant) => participant.userId.toString() != userId,
            );

            if (!otherParticipant) {
                throw new ValidationError(CHAT_MESSAGES.RECIEVER_NOT_FOUND, 400);
            }

            const message = await this._chatService.sendMessage({
                conversationId,
                senderId: userId,
                senderType: userRole === "user" ? "User" : "Company",
                receiverId: otherParticipant.userId.toString(),
                receiverType: otherParticipant.userType,
                content,
                messageType: (messageType as MessageType) || MessageType.TEXT,
            });

            return ApiResponse.success(res, CHAT_MESSAGES.MESSAGE_SENT_SUCCESS, message);
        } catch (error) {
            next(error);
        }
    }

    async uploadFile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw new ValidationError(CHAT_MESSAGES.NO_FILE_FOUND, 400);
            }

            const { conversationId } = req.params;
            if (!conversationId) {
                throw new ValidationError(CHAT_MESSAGES.NO_CONVERSATION_ID_FOUND, 400);
            }
            const attachment = await this._chatService.uploadAttachment(req.file, "chat", conversationId);

            return ApiResponse.success(res, CHAT_MESSAGES.FILE_UPLOAD_SUCCESS, attachment);
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: conversationId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            await this._chatService.markMessagesAsRead(conversationId, userId);

            return ApiResponse.success(res, CHAT_MESSAGES.MESSAGE_MARK_READ);
        } catch (error) {
            next(error);
        }
    }

    async getUnreadCount(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const count = await this._chatService.getTotalUnreadCount(userId);

            return ApiResponse.success(res, CHAT_MESSAGES.MESSAGE_UNREAD_COUNT_FETCHED, { count });
        } catch (error) {
            next(error);
        }
    }

    async deleteMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { messageId } = req.params;

            const deleted = await this._chatService.deleteMessage(messageId);

            return ApiResponse.success(res, CHAT_MESSAGES.MESSAGE_DELETED_SUCCESSFULLY, { deleted });
        } catch (error) {
            next(error);
        }
    }
}
