import { Request, Response, NextFunction } from "express";

export interface IChatController {
    getConversations(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    createConversation(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getConversationById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getMessages(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    sendMessage(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    uploadFile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteMessage(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
