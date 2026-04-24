import { randomBytes, createHash } from "node:crypto";
import type { ITokenService } from "../../application/interfaces/ITokenService.js";

export class TokenService implements ITokenService {
  /**
   * Generate a random opaque access token (32 bytes = 64 hex characters)
   * This will be stored in the database and used for authentication
   */
  generateAccessToken(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Verify token is valid format (opaque tokens are verified against database)
   * This method just validates it's a hex string, actual verification happens in the repository
   */
  verifyAccessToken(token: string): boolean {
    // Check if token is a valid hex string
    return /^[a-f0-9]{64}$/.test(token);
  }

  /**
   * Hash a token using SHA256
   */
  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
