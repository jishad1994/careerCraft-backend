import { AppError } from "./app.error.";
export class ConflictError extends AppError {
    constructor(message: string, statusCode = 409) {
        super(message, statusCode, false);
    }
}
