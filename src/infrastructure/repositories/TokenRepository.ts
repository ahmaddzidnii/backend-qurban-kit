import type { Token } from "../../domain/entities/User.js";
import type { ITokenRepository } from "../../application/interfaces/IUserRepository.js";
import type { ITokenService } from "../../application/interfaces/ITokenService.js";
import { prisma } from "../../config/database.js";

export class TokenRepository implements ITokenRepository {
  constructor(private tokenService: ITokenService) {}

  async create(token: string, userId: string, expiresAt: Date): Promise<Token> {
    // Hash token before storing in database
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
    // Hash the provided token and look it up in database
    const hashedToken = this.tokenService.hashToken(token);
    return await prisma.userToken.findUnique({
      where: { token: hashedToken },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    // Hash the provided token and delete from database
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
