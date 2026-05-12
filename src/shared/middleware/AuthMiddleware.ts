import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../database.js";
import { InvalidTokenError } from "../errors/index.js";
import { verifyAccessToken, hashToken } from "../services/index.js";

export interface AuthenticatedRequest extends Request {
    userId?: string;
    token?: string;
}

export async function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.slice(7);

    // Verify token format
    if (!verifyAccessToken(token)) {
        return next();
    }

    // Hash token for lookup
    const hashedTokenValue = hashToken(token);

    // Lookup token in database
    const tokenRecord = await prisma.userToken.findUnique({
        where: { token: hashedTokenValue },
    });
    if (!tokenRecord) {
        return next();
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
        return next();
    }

    // Token is valid, set userId in request
    req.userId = tokenRecord.userId;
    req.token = token;
    next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.userId) {
        throw new InvalidTokenError();
    }
    next();
}
