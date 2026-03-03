import express from "express";
import { notificationController } from "../dependencies/container.dependency";

export const notificationRoutes = express.Router();

notificationRoutes.get("/", notificationController.getNotifications.bind(notificationController));
notificationRoutes.put("/:id/read", notificationController.markAsRead.bind(notificationController));
notificationRoutes.put("/read-all", notificationController.markAllAsRead.bind(notificationController));
notificationRoutes.delete("/:id", notificationController.deleteNotification.bind(notificationController));
notificationRoutes.delete("/delete-all", notificationController.deleteNotification.bind(notificationController));
