import { AppError } from "./app.error";

export { AppError } from "./app.error";
export * from "./auth.error";

export class UserNotFoundError extends AppError {
    constructor() {
        super(
            "USER_NOT_FOUND",
            "We couldn't find a user with those details. Please check and try again.",
            404,
        );
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(
            "NOT_FOUND",
            message || "We couldn't find what you were looking for.",
            404,
        );
    }
}

export class MissingWilayahParentIdError extends AppError {
    constructor(level: string) {
        super(
            "MISSING_WILAYAH_PARENT_ID",
            `parent_id is required for ${level} level`,
            400,
        );
    }
}

export class InvalidWilayahLevelError extends AppError {
    constructor(level: string) {
        super(
            "INVALID_WILAYAH_LEVEL",
            `Invalid level: ${level}`,
            400,
        );
    }
}
