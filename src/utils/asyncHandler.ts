import { NextFunction, Request, RequestHandler, Response } from "express";

export type asyncController = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler = (fn: asyncController): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
