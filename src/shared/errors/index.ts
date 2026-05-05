export abstract class AppError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode: number = 400,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class UserAlreadyExistsError extends AppError {
    constructor(email: string) {
        super(
            "USER_ALREADY_EXISTS",
            `We already have an account registered with ${email}. Please sign in or use a different email.`,
            409,
        );
    }
}

export class InvalidCredentialsError extends AppError {
    constructor() {
        super(
            "INVALID_CREDENTIALS",
            "We couldn't sign you in with those credentials. Please check your email and password and try again.",
            401,
        );
    }
}

export class TokenExpiredError extends AppError {
    constructor() {
        super(
            "TOKEN_EXPIRED",
            "Your session has expired. Please sign in again to continue.",
            401,
        );
    }
}

export class InvalidTokenError extends AppError {
    constructor() {
        super(
            "INVALID_TOKEN",
            "Your session token is invalid. Please sign in again to continue.",
            401,
        );
    }
}

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
