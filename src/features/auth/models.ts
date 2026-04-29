// Import Prisma types as single source of truth
import type { User as PrismaUser, UserToken as PrismaUserToken } from "../../../generated/prisma/client";
import type { Role } from "../../../generated/prisma/enums";

// ============================================
// DTOs (Request/Response)
// ============================================

export interface RegisterRequestDTO {
    email: string;
    password: string;
    name?: string;
}

export interface LoginRequestDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    user: {
        id: string;
        email: string;
        fullName: string;
    };
    accessToken: string;
}

// ============================================
// Database Models (from Prisma - Single Source of Truth)
// ============================================

// Re-export Prisma types for use throughout the app
export type User = PrismaUser;
export type Token = PrismaUserToken;
export type { Role };
