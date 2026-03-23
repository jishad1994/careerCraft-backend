import express from "express";
import { companyAuthMiddleware } from "../../middlewares/company.auth.middleware";
import { chatController } from "../../dependencies/container.dependency";
import { upload } from "../../middlewares/multer.middleware";

const companyChatRoutes = express.Router();

companyChatRoutes.use(companyAuthMiddleware);

// Conversations
companyChatRoutes.get("/", chatController.getConversations.bind(chatController));
companyChatRoutes.post("/", chatController.createConversation.bind(chatController));
companyChatRoutes.get("/:id", chatController.getConversationById.bind(chatController));

// Messages
companyChatRoutes.get("/:id/messages", chatController.getMessages.bind(chatController));
companyChatRoutes.post("/:id/messages", chatController.sendMessage.bind(chatController));
companyChatRoutes.put("/:id/read", chatController.markAsRead.bind(chatController));

// File upload
companyChatRoutes.post("/:conversationId/upload", upload.single("file"), chatController.uploadFile.bind(chatController));

// Unread count
companyChatRoutes.get("/unread-count", chatController.getUnreadCount.bind(chatController));

// Delete message
companyChatRoutes.delete("/messages/:messageId", chatController.deleteMessage.bind(chatController));

export default companyChatRoutes;
