import { AppError } from "./app.error.js";

export class UserAlreadyExistsError extends AppError {
    constructor(email: string) {
        super({
            statusCode: 409,
            code: "USER_ALREADY_EXISTS",
            message: `Akun dengan email ${email} sudah terdaftar. Silakan masuk atau gunakan email lain.`,
        });
    }
}

export class InvalidCredentialsError extends AppError {
    constructor() {
        super({
            statusCode: 401,
            code: "INVALID_CREDENTIALS",
            message: "Email atau password yang Anda masukkan salah. Silakan coba lagi.",
        });
    }
}

export class TokenExpiredError extends AppError {
    constructor() {
        super({
            statusCode: 401,
            code: "TOKEN_EXPIRED",
            message: "Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.",
        });
    }
}

export class InvalidTokenError extends AppError {
    constructor() {
        super({
            statusCode: 401,
            code: "INVALID_TOKEN",
            message: "Token sesi tidak valid. Silakan masuk kembali untuk melanjutkan.",
        });
    }
}

export class AlreadyAuthenticatedError extends AppError {
    constructor() {
        super({
            statusCode: 400,
            code: "ALREADY_AUTHENTICATED",
            message: "Anda sudah masuk. Silakan keluar terlebih dahulu untuk masuk dengan akun lain.",
        });
    }
}