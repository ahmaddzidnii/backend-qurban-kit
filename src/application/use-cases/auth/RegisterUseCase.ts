import type { AuthResponseDTO, RegisterRequestDTO } from "../../dto/AuthDTO.js";
import { UserAlreadyExistsError } from "../../../domain/errors/DomainError.js";
import type { IUserRepository } from "../../interfaces/IUserRepository.js";
import type { ITokenRepository } from "../../interfaces/IUserRepository.js";
import type { ITokenService } from "../../interfaces/ITokenService.js";
import type { IPasswordService } from "../../interfaces/IPasswordService.js";

export class RegisterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: ITokenRepository,
    private tokenService: ITokenService,
    private passwordService: IPasswordService,
  ) {}

  async execute(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(data.email);
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(data.password);

    // Create user
    const user = await this.userRepository.create(data.email, hashedPassword, data.name);

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
}
