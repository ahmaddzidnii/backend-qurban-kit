import { randomBytes, createHash } from "node:crypto";

/**
 * Generate a random opaque access token (32 bytes = 64 hex characters)
 */
export function generateAccessToken(): string {
    return randomBytes(32).toString("hex");
}

/**
 * Verify token is valid format (64 hex characters)
 */
export function verifyAccessToken(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
}

/**
 * Hash a token using SHA256
 */
export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}
