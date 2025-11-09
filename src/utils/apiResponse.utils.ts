import { Response } from "express";

export class ApiResponse {
    static  success<T>(res: Response, message: string, data?: T, statusCode = 200) {
        return res.status(statusCode).json({ success: true, message, data: data || null });
    }

    static error<T>(res: Response, message: string, errors?: T, statusCode = 400) {
        return res.status(statusCode).json({ success: false, message, errors: errors || null });
    }

    static created<T>(res: Response, message: string, data?: T) {
        return this.success(res, message, data, 201);
    }

    static validationError<T>(res: Response, message = "Validation failed", errors?: T) {
        return this.error(res, message, errors, 422);
    }

    static unauthorized(res: Response, message = "unauthorized") {
        return this.error(res, message, null, 401);
    }

    static forbidden(res: Response, message = "Forbidden") {
        return this.error(res, message, null, 403);
    }
    static notFound(res: Response, message = "Resource not found") {
        return this.error(res, message, null, 404);
    }
}
