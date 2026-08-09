import express from "express";
import { commonAuthMiddleware } from "../middlewares/common.auth.middleware";
import { chatController } from "../dependencies/container.dependency";
import { upload } from "../middlewares/multer.middleware";

const chatRoutes = express.Router();

chatRoutes.use(commonAuthMiddleware);

// Conversations
chatRoutes.get("/", chatController.getConversations.bind(chatController));
chatRoutes.post("/", chatController.createConversation.bind(chatController));
chatRoutes.get("/:id", chatController.getConversationById.bind(chatController));

// Messages
chatRoutes.get("/:id/messages", chatController.getMessages.bind(chatController));
chatRoutes.post("/:id/messages", chatController.sendMessage.bind(chatController));
chatRoutes.put("/:id/read", chatController.markAsRead.bind(chatController));

// File upload
chatRoutes.post("/:conversationId/upload", upload.single("file"), chatController.uploadFile.bind(chatController));

// Unread count
chatRoutes.get("/unread-count", chatController.getUnreadCount.bind(chatController));

// Delete message
chatRoutes.delete("/messages/:messageId", chatController.deleteMessage.bind(chatController));

export default chatRoutes;
