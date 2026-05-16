import { NextFunction, Request, Response } from "express";

import { prisma } from "@/database";
import { Role } from "@prisma/client";
import { InvalidTokenError } from "../errors";
import { hashToken } from "../services";

declare global {
    namespace Express {
        interface Request {
            auth?: {
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    role: Role;

                };
                token: string;
            };
        }
    }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        return next();
    }

    const hashedTokenValue = hashToken(token);

    const tokenWithUser = await prisma.userToken.findUnique({
        where: {
            token: hashedTokenValue,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                }
            }
        },
    })

    if (!tokenWithUser || tokenWithUser.expiresAt < new Date()) {
        return next();
    }

    req.auth = {
        user: {
            id: tokenWithUser.user.id,
            fullName: tokenWithUser.user.fullName,
            email: tokenWithUser.user.email,
            role: tokenWithUser.user.role,
        },
        token,
    }

    next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    if (!req.auth) {
        throw new InvalidTokenError();
    }

    next();
}

export const requireUnAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.auth) {
        return res.status(400).json({ message: "Already authenticated" });
    }
    next();
}