export interface ITokenService {
  /**
   * Generate a new random opaque access token
   * The token is stored in the database with user information
   */
  generateAccessToken(): string;

  /**
   * Verify token format (check if it's a valid hex string)
   * Actual verification against database happens in the repository
   */
  verifyAccessToken(token: string): boolean;

  /**
   * Hash a token using SHA256
   */
  hashToken(token: string): string;
}
