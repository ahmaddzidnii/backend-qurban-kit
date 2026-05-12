import { AppError } from "./app.error";

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