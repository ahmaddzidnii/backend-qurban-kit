/**
 * Auth Database Models
 * Re-exports from Prisma - single source of truth for database types
 */

import type { User as PrismaUser, UserToken as PrismaUserToken } from "@prisma/client";
import type { Role } from "@prisma/client";

// Database Models - from Prisma
export type User = PrismaUser;
export type Token = PrismaUserToken;
export type { Role };
