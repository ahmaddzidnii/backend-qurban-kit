import bcrypt from "bcrypt";

/**
 * Password Service - Handles password hashing and validation
 * Only deals with password operations, no business logic
 */
export class PasswordService {
    /**
     * Hash a password using bcrypt
     */
    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    /**
     * Compare a password with a hashed password
     */
    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
