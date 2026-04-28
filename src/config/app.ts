import type { Express } from "express";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { AuthService } from "../features/auth/services.js";
import { AuthController } from "../features/auth/controllers.js";
import { createAuthRoutes } from "../features/auth/routes.js";
import { AuthMiddleware } from "../shared/middleware/index.js";
import { ErrorHandlingMiddleware } from "../shared/middleware/index.js";
import { formatUptime } from "../shared/utils/index.js";
import { Router as ExpressRouter } from "express";

export function createApp(): Express {
  const app = express();

  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Initialize auth service (consolidates all auth repositories, services, and use cases)
  const authService = new AuthService();

  // Initialize controller
  const authController = new AuthController(authService);

  // Initialize middleware
  const authMiddleware = new AuthMiddleware(
    authService.getTokenService(),
    authService.getTokenRepository()
  );

  // Apply authentication middleware globally
  app.use((req, res, next) => authMiddleware.authenticate(req, res, next));

  // Setup API routes
  const apiRouter = ExpressRouter();

  // Health check endpoint
  apiRouter.get("/", (req, res) => {
    return res.json({
      name: "Qurban Kit Backend API",
      status: "HEALTHY",
      sysdate: new Date().toISOString(),
      uptime: formatUptime(process.uptime()),
    });
  });

  // Auth routes
  const authRoutes = createAuthRoutes(authController, authMiddleware);
  apiRouter.use("/auth", authRoutes);

  app.use("/", apiRouter);

  app.use(ErrorHandlingMiddleware.notFound);
  app.use(ErrorHandlingMiddleware.errorHandler);

  return app;
}
