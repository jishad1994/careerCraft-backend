import { NextFunction, Request, Response } from "express";
import { IChatService } from "../../services/chat/chat.service.interface";
import { IChatController } from "./chat.controller.interface";
import { AuthError } from "../../errors-classes/auth.error";
import { HTTP_MESSAGES } from "../../constants/messages/http.messages.constants";
import { ApiResponse } from "../../utils/apiResponse.utils";
import { ValidationError } from "../../errors-classes/validation.error";
import { MessageType } from "../../models/chat/interfaces/message.interface";

export class ChatController implements IChatController {
    constructor(private readonly _chatService: IChatService) {}

    /**
     * Get all conversations for logged-in user
     */
    async getConversations(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }
            const conversations = await this._chatService.getUserConversations(userId);

            return ApiResponse.success(res, "Conversations fetch successfull", conversations);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get or create conversation
     * POST /api/chat/conversations
     */
    async createConversation(req: Request, res: Response, next: NextFunction) {
        try {
            const { otherUserId, jobId, applicationId } = req.body;

            const currentUserId = req.user?.id;
            const currentUserRole = req.user?.role;

            if (!currentUserId || !currentUserRole) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const isCompany = currentUserRole === "company";

            const userId = isCompany ? otherUserId : currentUserId;
            const companyId = isCompany ? currentUserId : otherUserId;

            const conversation = await this._chatService.getOrCreateConversation(
                userId,
                companyId,
                currentUserId,
                jobId,
                applicationId,
            );

            return ApiResponse.success(res, "Conversation created successfully", conversation);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get conversation by ID
     */
    async getConversationById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const conversation = await this._chatService.getConversationById(id);

            if (!conversation) {
                throw new ValidationError("Conversation not found", 404);
            }

            const isParticipant = conversation.participants.some((p) => p.userId.toString() === userId);

            if (!isParticipant) {
                throw new AuthError(HTTP_MESSAGES.FORBIDDEN, 403);
            }

            return ApiResponse.success(res, "Conversation fetched successfully", conversation);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get messages
     */
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
                throw new ValidationError("Conversation not found", 404);
            }

            const isParticipant = conversation.participants.some((p) => p.userId.toString() === userId);

            if (!isParticipant) {
                throw new AuthError(HTTP_MESSAGES.FORBIDDEN, 403);
            }

            const { messages, paginationMeta } = await this._chatService.getMessages(id, page, limit);

            return ApiResponse.success(res, "Messages fetched successfully", messages, 200, paginationMeta);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Send message
     */
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
                throw new ValidationError("Conversation not found", 404);
            }

            const otherParticipant = conversation.participants.find(
                (participant) => participant.userId.toString() != userId,
            );

            if (!otherParticipant) {
                throw new ValidationError("Receiver not found", 400);
            }

            const message = await this._chatService.sendMessage({
                conversationId,
                senderId: userId,
                senderType: userRole === "user" ? "user" : "company",
                receiverId: otherParticipant.userId.toString(),
                receiverType: otherParticipant.userType,
                content,
                messageType: (messageType as MessageType) || MessageType.TEXT,
            });

            return ApiResponse.success(res, "Message sent successfully", message);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload file
     */
    async uploadFile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw new ValidationError("No file uploaded", 400);
            }

            const { conversationId } = req.params;
            if (!conversationId) {
                throw new ValidationError("No conversation id found", 400);
            }
            const attachment = await this._chatService.uploadAttachment(req.file, "chat", conversationId);

            return ApiResponse.success(res, "File uploaded successfully", attachment);
        } catch (error) {
            next(error);
        }
    }
    /**
     * Mark as read
     */
    async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: conversationId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            await this._chatService.markMessagesAsRead(conversationId, userId);

            return ApiResponse.success(res, "Messages marked as read");
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get unread count
     */
    async getUnreadCount(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AuthError(HTTP_MESSAGES.UNAUTHORIZED, 401);
            }

            const count = await this._chatService.getTotalUnreadCount(userId);

            return ApiResponse.success(res, "Unread count fetched", { count });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete message
     */
    async deleteMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { messageId } = req.params;

            const deleted = await this._chatService.deleteMessage(messageId);

            return ApiResponse.success(res, "Message deleted successfully", { deleted });
        } catch (error) {
            next(error);
        }
    }
}
