import { Role } from "@prisma/client";
import type { Prisma as PrismaNamespace } from "@prisma/client";

import { prisma } from "../config/database.js";
import { BaseRepository } from "./base.repository.js";

type User = PrismaNamespace.UserGetPayload<{}>;

/**
 * User Repository - Handles all user database operations
 * Only deals with Prisma calls, no business logic
 * Uses Prisma User type as single source of truth
 */
export class UserRepository extends BaseRepository<User> {
    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Get all users
     */
    async findAll(): Promise<User[]> {
        return await prisma.user.findMany();
    }

    /**
     * Create a new user
     */
    async create(data: Partial<User>): Promise<User> {
        return await prisma.user.create({
            data: {
                email: data.email || "",
                password: data.password || "",
                fullName: data.fullName || "",
                role: data.role || Role.ADMIN_MASJID,
            },
        });
    }

    /**
     * Update user data
     */
    async update(id: string, data: Partial<User>): Promise<User> {
        // Filter out fields that shouldn't be updated
        const updateData = {
            ...(data.email && { email: data.email }),
            ...(data.password && { password: data.password }),
            ...(data.fullName && { fullName: data.fullName }),
            ...(data.role && { role: data.role }),
        };

        return await prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Delete user
     */
    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }
}
