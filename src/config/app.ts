import type { Express } from "express";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { UserRepository, TokenRepository } from "../infrastructure/repositories/index.js";
import { PasswordService, TokenService } from "../infrastructure/services/index.js";
import { RegisterUseCase, LoginUseCase } from "../application/use-cases/auth/index.js";
import { AuthController } from "../presentation/controllers/index.js";
import { AuthMiddleware, ErrorHandlingMiddleware } from "../presentation/middleware/index.js";
import { createAuthRoutes, createApiRoutes } from "../presentation/routes/index.js";

export function createApp(): Express {
  const app = express();

  // Setup middleware
  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Initialize repositories
  const userRepository = new UserRepository();

  // Initialize services first (needed by repositories)
  const passwordService = new PasswordService();
  const tokenService = new TokenService();

  // Initialize token repository with token service
  const tokenRepository = new TokenRepository(tokenService);

  // Initialize use cases
  const registerUseCase = new RegisterUseCase(userRepository, tokenRepository, tokenService, passwordService);
  const loginUseCase = new LoginUseCase(userRepository, tokenRepository, tokenService, passwordService);

  // Initialize controllers
  const authController = new AuthController(registerUseCase, loginUseCase);

  // Initialize middleware
  const authMiddleware = new AuthMiddleware(tokenService, tokenRepository);

  // Apply authentication middleware globally
  app.use(authMiddleware.authenticate);

  // Setup routes
  const authRoutes = createAuthRoutes(authController, authMiddleware);
  const apiRoutes = createApiRoutes(authRoutes);

  app.use("/", apiRoutes);

  // Error handling (must be last)
  app.use(ErrorHandlingMiddleware.notFound);
  app.use(ErrorHandlingMiddleware.errorHandler);

  return app;
}
