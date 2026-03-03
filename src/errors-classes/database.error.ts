import { AppError } from "./app.error.";

export class DataBaseError extends AppError {
    constructor(message: string, statusCode = 500) {
        super(message, statusCode, false);
    }
}
