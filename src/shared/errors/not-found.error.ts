import { AppError } from "./app.error.js";

export class UserNotFoundError extends AppError {
    constructor() {
        super({
            statusCode: 404,
            code: "USER_NOT_FOUND",
            message: "We couldn't find a user with those details. Please check and try again.",
        });
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super({
            statusCode: 404,
            code: "NOT_FOUND",
            message: message || "We couldn't find what you were looking for.",
        });
    }
}
