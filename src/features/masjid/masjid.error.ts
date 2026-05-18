import { AppError } from "@shared/errors/app.error.js";

export class FileValidationError extends AppError {
    constructor(message: string) {
        super({
            statusCode: 400,
            code: "FILE_VALIDATION_ERROR",
            message,
        });
    }
}

export class FileUploadError extends AppError {
    constructor(message: string) {
        super({
            statusCode: 400,
            code: "FILE_UPLOAD_ERROR",
            message,
        });
    }
}

export class FileTooLargeError extends AppError {
    constructor() {
        super({
            statusCode: 413,
            code: "FILE_TOO_LARGE",
            message: "File terlalu besar. Maksimal 10MB per file.",
        });
    }
}

export class TooManyFilesError extends AppError {
    constructor() {
        super({
            statusCode: 400,
            code: "TOO_MANY_FILES",
            message: "Terlalu banyak file. Maksimal 2 file.",
        });
    }
}
