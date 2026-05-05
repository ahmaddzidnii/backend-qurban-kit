import { Role, type Prisma as PrismaNamespace } from "@prisma/client";

import type { RegisterRequestDTO, LoginRequestDTO, AuthResponseDTO } from "./dtos.js";
import {
    UserAlreadyExistsError,
    InvalidCredentialsError,
} from "../../shared/errors/index.js";
import { prisma } from "../../config/database.js";
import { hashPassword, comparePassword, generateAccessToken, hashToken } from "../../shared/services/index.js";

type User = PrismaNamespace.UserGetPayload<{}>;

/**
 * Register a new user
 */
export async function registerUser(data: RegisterRequestDTO) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new UserAlreadyExistsError(data.email);
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            fullName: data.name || "",
            role: Role.ADMIN_MASJID,
        },
    });

    const { password, ...safeUser } = user;

    return safeUser;
}

/**
 * Login user and generate access token
 */
export async function loginUser(data: LoginRequestDTO): Promise<AuthResponseDTO> {
    // Find user
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (!user) {
        throw new InvalidCredentialsError();
    }

    // Verify password
    const isPasswordValid = await comparePassword(
        data.password,
        user.password
    );
    if (!isPasswordValid) {
        throw new InvalidCredentialsError();
    }

    // Generate access token
    const accessToken = generateAccessToken();

    // Hash token before storing
    const hashedTokenValue = hashToken(accessToken);

    // Store access token in database by default with 15 minutes expiry
    const sessionLifetimeMinutes = parseInt(process.env.SESSION_LIFETIME || "15", 10);
    const accessTokenExpiresAt = new Date(Date.now() + sessionLifetimeMinutes * 60 * 1000);
    await prisma.userToken.create({
        data: {
            token: hashedTokenValue,
            userId: user.id,
            expiresAt: accessTokenExpiresAt,
        },
    });

    return {
        accessToken,
    };
}

/**
 * Logout user
 */
export async function logoutUser(token?: string): Promise<void> {
    if (!token) {
        throw new InvalidCredentialsError();
    }

    // Hash token before querying
    const hashedTokenValue = hashToken(token);
    await prisma.userToken.delete({
        where: { token: hashedTokenValue },
    });
}

/**
 * Get user profile
 */
export async function getUserProfile(id?: string) {
    if (!id) {
        throw new InvalidCredentialsError();
    }

    const user = await prisma.user.findUnique({
        where: { id },
    });

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
