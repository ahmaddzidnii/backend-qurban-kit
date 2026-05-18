import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { env } from "@/env.js";
import { AppError } from "@shared/errors/app.error.js";
import { InternalServerError } from "@shared/errors/internal-server.error.js";
import { NotFoundError } from "@shared/errors/not-found.error.js";

export type ErrorResponse = {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
    stack?: string;
};

function formatZodErrors(error: ZodError): Record<string, string[]> {
    return error.issues.reduce<Record<string, string[]>>((acc, issue) => {
        const path = issue.path.join(".");

        if (!acc[path]) {
            acc[path] = [];
        }

        acc[path].push(issue.message);

        return acc;
    }, {});
}

function normalizeError(error: unknown): AppError {
    // Zod validation error
    if (error instanceof ZodError) {
        return new AppError({
            statusCode: 400,
            code: "VALIDATION_ERROR",
            message: "Validation error",
            errors: formatZodErrors(error),
        });
    }

    // Custom app error
    if (error instanceof AppError) {
        return error;
    }

    // Prisma database error
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string" &&
        error.code.startsWith("P")
    ) {
        return new AppError({
            statusCode: 500,
            code: "DATABASE_ERROR",
            message: "An error occurred while processing your request",
        });
    }

    // Unknown error
    return new InternalServerError();
}

function buildErrorResponse(error: AppError): ErrorResponse {
    return {
        code: error.code,
        message: error.message,
        ...(error.errors && { errors: error.errors }),
        ...(env.NODE_ENV !== "production" && {
            stack: error.stack,
        }),
    };
}

export function notFound(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response<ErrorResponse>,
    _next: NextFunction
): void {
    const error = normalizeError(err);

    res.status(error.statusCode).json(buildErrorResponse(error));
}
