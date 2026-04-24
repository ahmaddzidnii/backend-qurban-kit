import type { User } from "../../domain/entities/User.js";
import type { IUserRepository } from "../../application/interfaces/IUserRepository.js";
import { prisma } from "../../config/database.js";
import { Role } from "../../../generated/prisma/enums.js";

export class UserRepository implements IUserRepository {
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

  async create(email: string, hashedPassword: string, fullName?: string, role?: string): Promise<User> {
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
