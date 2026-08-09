import { NextFunction, Request, Response } from "express";

export interface IUserNotificationController {
    getNotifications(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteNotification(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteAllRead(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
