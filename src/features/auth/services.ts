import type { RegisterRequestDTO, LoginRequestDTO, AuthResponseDTO } from "./dtos.js";
import type { Prisma as PrismaNamespace } from "../../../generated/prisma/client.js";
import {
    UserAlreadyExistsError,
    InvalidCredentialsError,
} from "../../shared/errors/index.js";
import { UserRepository, TokenRepository } from "../../repositories/index.js";
import { PasswordService, TokenService } from "../../shared/services/index.js";

type User = PrismaNamespace.UserGetPayload<{}>;

/**
 * Auth Service - main service consolidating all auth operations
 * Handles business logic for authentication
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
        this.tokenRepository = new TokenRepository();
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
        const user = await this.userRepository.create({
            email: data.email,
            password: hashedPassword,
            fullName: data.name || "",
        });

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

        // Hash token before storing
        const hashedToken = this.tokenService.hashToken(accessToken);

        // Store access token in database by default with 15 minutes expiry
        const sessionLifetimeMinutes = parseInt(process.env.SESSION_LIFETIME || "15", 10);
        const accessTokenExpiresAt = new Date(Date.now() + sessionLifetimeMinutes * 60 * 1000);
        await this.tokenRepository.create({
            token: hashedToken,
            userId: user.id,
            expiresAt: accessTokenExpiresAt,
        } as any);

        return {
            accessToken,
        };
    }

    async logout(token?: string): Promise<void> {

        if (!token) {
            throw new InvalidCredentialsError();
        }

        // Hash token before querying
        const hashedToken = this.tokenService.hashToken(token);
        await this.tokenRepository.deleteByHashedToken(hashedToken);
    }

    /**
     * Get user profile
     */
    async getProfile(id?: string) {

        if (!id) {
            throw new InvalidCredentialsError();
        }

        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
        }
    }

    // Expose repositories and services for middleware and other use cases
    getTokenService(): TokenService {
        return this.tokenService;
    }

    getTokenRepository(): TokenRepository {
        return this.tokenRepository;
    }
}
