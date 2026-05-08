import express from "express";
import { notificationController } from "../dependencies/container.dependency";
import { notificationAuthMiddleware } from "../middlewares/notification-auth.middlware";
import { checkAccountBlockedMiddleware } from "../middlewares/checkAccountBlocked.middleware";

export const notificationRoutes = express.Router();
notificationRoutes.use(notificationAuthMiddleware);
notificationRoutes.get("/",checkAccountBlockedMiddleware, notificationController.getNotifications.bind(notificationController));
notificationRoutes.put("/:id/read",checkAccountBlockedMiddleware, notificationController.markAsRead.bind(notificationController));
notificationRoutes.put("/read-all", checkAccountBlockedMiddleware, notificationController.markAllAsRead.bind(notificationController));
notificationRoutes.delete("/delete-all", checkAccountBlockedMiddleware, notificationController.deleteNotification.bind(notificationController));
notificationRoutes.delete("/:id", checkAccountBlockedMiddleware, notificationController.deleteNotification.bind(notificationController));
