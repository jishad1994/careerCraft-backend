import { AppError } from "./app.error.";

export class ValidationError extends AppError {
    constructor(message: string, statusCode = 400) {
        super(message, statusCode, true);
    }
}
