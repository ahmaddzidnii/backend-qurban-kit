import type { NextFunction, Request, Response } from "express";
import { InvalidTokenError } from "../errors/index.js";

export interface AuthenticatedRequest extends Request {
    userId?: string;
    token?: string;
}

export interface ITokenService {
    verifyAccessToken(token: string): boolean;
    hashToken(token: string): string;
}

export interface ITokenRepository {
    findByHashedToken(hashedToken: string): Promise<{ expiresAt: Date; userId: string } | null>;
}

export class AuthMiddleware {
    constructor(
        private tokenService: ITokenService,
        private tokenRepository: ITokenRepository
    ) { }

    async authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.slice(7);

        // Verify token format
        if (!this.tokenService.verifyAccessToken(token)) {
            return next();
        }

        // Hash token for lookup
        const hashedToken = this.tokenService.hashToken(token);

        // Lookup token in database
        const tokenRecord = await this.tokenRepository.findByHashedToken(hashedToken);
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

        console.log(token)
        next();
    }

    requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        if (!req.userId) {
            throw new InvalidTokenError();
        }
        next();
    }
}
