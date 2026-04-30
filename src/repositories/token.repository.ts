import type { Prisma as PrismaNamespace } from "@prisma/client";
import { prisma } from "../config/database.js";
import { BaseRepository } from "./base.repository.js";

type Token = PrismaNamespace.UserTokenGetPayload<{}>;

/**
 * Token Repository - Handles all user token database operations
 * Only deals with Prisma calls, no business logic
 * Uses Prisma UserToken type as single source of truth
 */
export class TokenRepository extends BaseRepository<Token> {
    /**
     * Find token by ID
     */
    async findById(id: string): Promise<Token | null> {
        return await prisma.userToken.findUnique({
            where: { id },
        });
    }

    /**
     * Get all tokens
     */
    async findAll(): Promise<Token[]> {
        return await prisma.userToken.findMany();
    }

    /**
     * Create a new token
     */
    async create(data: Partial<Token>): Promise<Token> {
        return await prisma.userToken.create({
            data: {
                token: data.token || "",
                userId: data.userId || "",
                expiresAt: data.expiresAt || new Date(),
            },
        });
    }

    /**
     * Update token data
     */
    async update(id: string, data: Partial<Token>): Promise<Token> {
        return await prisma.userToken.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete token by ID
     */
    async delete(id: string): Promise<void> {
        await prisma.userToken.delete({
            where: { id },
        });
    }

    /**
     * Find token by token value (with hashing)
     * Note: Caller must hash the token before passing
     */
    async findByHashedToken(hashedToken: string): Promise<Token | null> {
        return await prisma.userToken.findUnique({
            where: { token: hashedToken },
        });
    }

    /**
     * Delete token by hashed token value
     * Note: Caller must hash the token before passing
     */
    async deleteByHashedToken(hashedToken: string): Promise<void> {
        await prisma.userToken.delete({
            where: { token: hashedToken },
        });
    }

    /**
     * Delete all expired tokens
     */
    async deleteExpired(): Promise<void> {
        await prisma.userToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
}
