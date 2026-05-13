import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { env } from "@/env.js";
import { NotFoundError, type AppError } from "@shared/errors/index.js";

export type ErrorResponse = {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
    stack?: string;
};

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
    const errorMap: Record<string, string[]> = {};

    error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!errorMap[path]) {
            errorMap[path] = [];
        }
        errorMap[path].push(issue.message);
    });

    return errorMap;
}

export function notFound(req: Request, res: Response, next: NextFunction): void {
    const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
    next(error);
}

export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response<ErrorResponse>,
    _next: NextFunction
): void {
    let statusCode = 500;
    let code = "INTERNAL_SERVER_ERROR";
    let message = err.message;

    if (err instanceof z.ZodError) {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        message = "Validation error";
        const errors = formatZodErrors(err);

        res.status(statusCode).json({
            code,
            message,
            errors,
            ...(env.NODE_ENV !== "production" && { stack: err.stack }),
        });

        return;
    }

    // Check if it's an AppError (has code and statusCode properties)
    else if ("code" in err && "statusCode" in err) {
        const appErr = err as AppError;
        statusCode = appErr.statusCode;
        code = appErr.code;
        message = appErr.message;
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
