import bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";
import type { RegisterRequestDTO, LoginRequestDTO, AuthResponseDTO, User, Token } from "./models.js";
import { prisma } from "../../config/database.js";
import {
    UserAlreadyExistsError,
    InvalidCredentialsError,
} from "../../shared/errors/index.js";
import { Role } from "../../../generated/prisma/enums.js";

/**
 * Password Service - handles password hashing and validation
 */
class PasswordService {
    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}

/**
 * Token Service - handles token generation and validation
 */
class TokenService {
    /**
     * Generate a random opaque access token (32 bytes = 64 hex characters)
     */
    generateAccessToken(): string {
        return randomBytes(32).toString("hex");
    }

    /**
     * Verify token is valid format
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

/**
 * User Repository - handles user database operations
 */
class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    async create(
        email: string,
        hashedPassword: string,
        fullName?: string,
        role?: string
    ): Promise<User> {
        return await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName: fullName || "",
                role: (role as Role) || Role.ADMIN_MASJID,
            },
        });
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }
}

/**
 * Token Repository - handles token database operations
 */
class TokenRepository {
    constructor(private tokenService: TokenService) { }

    async create(token: string, userId: string, expiresAt: Date): Promise<Token> {
        const hashedToken = this.tokenService.hashToken(token);
        return await prisma.userToken.create({
            data: {
                token: hashedToken,
                userId,
                expiresAt,
            },
        });
    }

    async findByToken(token: string): Promise<Token | null> {
        const hashedToken = this.tokenService.hashToken(token);
        return await prisma.userToken.findUnique({
            where: { token: hashedToken },
        });
    }

    async deleteByToken(token: string): Promise<void> {
        const hashedToken = this.tokenService.hashToken(token);
        await prisma.userToken.delete({
            where: { token: hashedToken },
        });
    }

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

/**
 * Auth Service - main service consolidating all auth operations
 */
export class AuthService {
    private passwordService: PasswordService;
    private tokenService: TokenService;
    private userRepository: UserRepository;
    private tokenRepository: TokenRepository;

    constructor() {
        this.passwordService = new PasswordService();
        this.tokenService = new TokenService();
        this.userRepository = new UserRepository();
        this.tokenRepository = new TokenRepository(this.tokenService);
    }

    /**
     * Register a new user
     */
    async register(data: RegisterRequestDTO) {
        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new UserAlreadyExistsError(data.email);
        }

        const hashedPassword = await this.passwordService.hash(data.password);
        const user = await this.userRepository.create(
            data.email,
            hashedPassword,
            data.name
        );

        return {
            ...user,
            password: undefined, // Don't return password hash
        };
    }

    /**
     * Login user and generate access token
     */
    async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
        // Find user
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new InvalidCredentialsError();
        }

        // Verify password
        const isPasswordValid = await this.passwordService.compare(
            data.password,
            user.password
        );
        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        // Generate access token
        const accessToken = this.tokenService.generateAccessToken();

        // Store access token in database (15 minutes expiry)
        const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.tokenRepository.create(accessToken, user.id, accessTokenExpiresAt);

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
            accessToken,
        };
    }

    /**
     * Get user profile
     */
    async getProfile() {

        return {
            name: "John Doe",
            email: "johndoe.@example.com",
            phone: "081234567890",
            address: "Jl. Raya No. 123, Jakarta",
        };
    }

    // Expose repositories and services for middleware and other use cases
    getTokenService(): TokenService {
        return this.tokenService;
    }

    getTokenRepository(): TokenRepository {
        return this.tokenRepository;
    }
}
