import type { NextFunction, Request, Response } from "express";
import type { DomainError } from "../../domain/errors/DomainError.js";
import { env } from "../../env.js";

export type ErrorResponse = {
  message: string;
  code?: string;
  stack?: string;
};

export class ErrorHandlingMiddleware {
  static notFound(req: Request, res: Response, next: NextFunction): void {
    res.status(404);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    next(error);
  }

  static errorHandler(err: Error | DomainError, req: Request, res: Response<ErrorResponse>, _next: NextFunction): void {
    let statusCode = 500;
    let code = "INTERNAL_SERVER_ERROR";

    // Check if it's a domain error
    if ("statusCode" in err && "code" in err) {
      statusCode = (err as DomainError).statusCode;
      code = (err as DomainError).code;
    }

    // Override status code if already set
    if (res.statusCode && res.statusCode !== 200) {
      statusCode = res.statusCode;
    }

    res.status(statusCode).json({
      message: err.message,
      code,
      ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  }
}
