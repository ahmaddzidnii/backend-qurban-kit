import type { NextFunction, Request, Response } from "express";
import { env } from "../../env.js";
import { NotFoundError, type AppError } from "../errors/index.js";

export type ErrorResponse = {
    message: string;
    code?: string;
    stack?: string;
};

export class ErrorHandlingMiddleware {
    static notFound(req: Request, res: Response, next: NextFunction): void {
        const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
        next(error);
    }

    static errorHandler(
        err: Error | AppError,
        req: Request,
        res: Response<ErrorResponse>,
        _next: NextFunction
    ): void {
        let statusCode = 500;
        let code = "INTERNAL_SERVER_ERROR";
        let message = err.message;

        // Check if it's an AppError (has code and statusCode properties)
        if ("code" in err && "statusCode" in err) {
            const appErr = err as AppError;
            statusCode = appErr.statusCode;
            code = appErr.code;
        }
        // Check if it's a Prisma error (database error)
        else if ("code" in err && typeof err.code === "string" && err.code.startsWith("P")) {
            statusCode = 500;
            code = "DATABASE_ERROR";
            message = "An error occurred while processing your request";
        }
        // Generic error defaults to 500 INTERNAL_SERVER_ERROR
        else {
            statusCode = 500;
            code = "INTERNAL_SERVER_ERROR";
        }

        res.status(statusCode).json({
            code,
            message,
            ...(env.NODE_ENV !== "production" && { stack: err.stack }),
        });
    }
}
