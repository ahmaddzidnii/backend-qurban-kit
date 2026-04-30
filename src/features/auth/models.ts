/**
 * Auth Database Models
 * Re-exports from Prisma - single source of truth for database types
 */

import type { User as PrismaUser, UserToken as PrismaUserToken } from "../../../generated/prisma/client";
import type { Role } from "../../../generated/prisma/enums";

// Database Models - from Prisma
export type User = PrismaUser;
export type Token = PrismaUserToken;
export type { Role };
