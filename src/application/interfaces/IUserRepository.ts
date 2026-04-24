import type { User, Token } from "../../domain/entities/User.js";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(email: string, hashedPassword: string, fullName?: string, role?: string): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface ITokenRepository {
  create(token: string, userId: string, expiresAt: Date): Promise<Token>;
  findByToken(token: string): Promise<Token | null>;
  deleteByToken(token: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
