import { NextFunction, Request, Response } from "express";

export function errorHandler(err: Error, re: Request, res: Response, next: NextFunction) {
    if (err) {
        console.log(err.stack);
        return res.status(500).json({ message: "something occured in the backend", error: err.message });
    }

    next();
}
