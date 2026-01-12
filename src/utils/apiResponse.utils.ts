import { Response } from "express";
import { HTTP_MESSAGES, HTTP_STATUS } from "../constants/http.constants";

export interface PaginationMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
}

export class ApiResponse {
    static success<T>(
        res: Response,
        message: string = HTTP_MESSAGES.SUCCESS,
        data?: T,
        statusCode: number = HTTP_STATUS.OK,
        pagination?: PaginationMeta
    ) {
        return res.status(statusCode).json({ success: true, message, data: data || null, pagination });
    }

    static error<T>(res: Response, message: string, errors?: T, statusCode: number = HTTP_STATUS.BAD_REQUEST) {
        return res.status(statusCode).json({ success: false, message, errors: errors || null });
    }

    static created<T>(res: Response, message: string = HTTP_MESSAGES.CREATED, data?: T) {
        return this.success(res, message, data, HTTP_STATUS.CREATED);
    }

    static validationError<T>(res: Response, message: string = HTTP_MESSAGES.VALIDATION_ERROR, errors?: T) {
        return this.error(res, message, errors, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }

    static unauthorized(res: Response, message: string = HTTP_MESSAGES.UNAUTHORIZED) {
        return this.error(res, message, null, HTTP_STATUS.UNAUTHORIZED);
    }

    static forbidden(res: Response, message: string = HTTP_MESSAGES.FORBIDDEN) {
        return this.error(res, message, null, HTTP_STATUS.FORBIDDEN);
    }
    static notFound(res: Response, message: string = HTTP_MESSAGES.NOT_FOUND) {
        return this.error(res, message, null, HTTP_STATUS.NOT_FOUND);
    }
}
