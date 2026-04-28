/**
 * Custom Error Classes for Application
 * Used across features for consistent error handling
 */

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
        super("USER_ALREADY_EXISTS", `User with email ${email} already exists`, 409);
    }
}

export class InvalidCredentialsError extends AppError {
    constructor() {
        super("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }
}

export class TokenExpiredError extends AppError {
    constructor() {
        super("TOKEN_EXPIRED", "Token has expired", 401);
    }
}

export class InvalidTokenError extends AppError {
    constructor() {
        super("INVALID_TOKEN", "Invalid token", 401);
    }
}

export class UserNotFoundError extends AppError {
    constructor() {
        super("USER_NOT_FOUND", "User not found", 404);
    }
}

export class ValidationError extends AppError {
    constructor(
        message: string,
        public readonly errors?: Record<string, string[]>,
    ) {
        super("VALIDATION_ERROR", message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super("NOT_FOUND", message, 404);
    }
}
