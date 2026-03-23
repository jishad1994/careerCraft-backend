import express from "express";
import { chatController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";
import { userAuthMiddleware } from "../../middlewares/user.auth.middleware";

const userChatRoutes = express.Router();

userChatRoutes.use(userAuthMiddleware);

// Conversations
userChatRoutes.get("/", chatController.getConversations.bind(chatController));
userChatRoutes.post("/", chatController.createConversation.bind(chatController));
userChatRoutes.get("/:id", chatController.getConversationById.bind(chatController));

// Messages
userChatRoutes.get("/:id/messages", chatController.getMessages.bind(chatController));
userChatRoutes.post("/:id/messages", chatController.sendMessage.bind(chatController));
userChatRoutes.put("/:id/read", chatController.markAsRead.bind(chatController));

// File upload
userChatRoutes.post("/:conversationId/upload", upload.single("file"), chatController.uploadFile.bind(chatController));

// Unread count
userChatRoutes.get("/unread-count", chatController.getUnreadCount.bind(chatController));

// Delete message
userChatRoutes.delete("/messages/:messageId", chatController.deleteMessage.bind(chatController));

export default userChatRoutes;
