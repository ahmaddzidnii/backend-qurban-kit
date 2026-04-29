import { randomBytes, createHash } from "node:crypto";

/**
 * Token Service - Handles token generation and validation
 * Only deals with token operations, no business logic
 */
export class TokenService {
    /**
     * Generate a random opaque access token (32 bytes = 64 hex characters)
     */
    generateAccessToken(): string {
        return randomBytes(32).toString("hex");
    }

    /**
     * Verify token is valid format (64 hex characters)
     */
    verifyAccessToken(token: string): boolean {
        return /^[a-f0-9]{64}$/.test(token);
    }

    /**
     * Hash a token using SHA256
     */
    hashToken(token: string): string {
        return createHash("sha256").update(token).digest("hex");
    }
}
