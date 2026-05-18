import { AppError } from "./app.error.js";

export class MissingWilayahParentIdError extends AppError {
    constructor(level: string) {
        super({
            statusCode: 400,
            code: "MISSING_WILAYAH_PARENT_ID",
            message: `parent_id is required for ${level} level`,
        });
    }
}

export class InvalidWilayahLevelError extends AppError {
    constructor(level: string) {
        super({
            statusCode: 400,
            code: "INVALID_WILAYAH_LEVEL",
            message: `Invalid level: ${level}`,
        });
    }
}
