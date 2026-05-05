import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";
import type { Express } from "express";
import { Router as ExpressRouter } from "express";

import { formatUptime } from "../shared/utils/index.js";
import { AuthService } from "../features/auth/services.js";
import { createAuthRoutes } from "../features/auth/routes.js";
import { AuthMiddleware } from "../shared/middleware/index.js";
import { AuthController } from "../features/auth/controllers.js";
import { createWilayahRoutes } from "../features/wilayah/routes.js";
import { ErrorHandlingMiddleware } from "../shared/middleware/index.js";

export function createApp(): Express {
  const app = express();

  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const authService = new AuthService();
  const authController = new AuthController(authService);

  const authMiddleware = new AuthMiddleware(
    authService.getTokenService(),
    authService.getTokenRepository()
  );

  app.use((req, res, next) => authMiddleware.authenticate(req, res, next));

  const apiRouter = ExpressRouter();

  apiRouter.get("/", (req, res) => {
    return res.json({
      name: "Qurban Kit Backend API",
      status: "HEALTHY",
      sysdate: new Date().toISOString(),
      uptime: formatUptime(process.uptime()),
    });
  });

  const authRoutes = createAuthRoutes(authController, authMiddleware);
  const wilayahRoutes = createWilayahRoutes();

  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/wilayah", wilayahRoutes);

  app.use("/", apiRouter);

  app.use(ErrorHandlingMiddleware.notFound);
  app.use(ErrorHandlingMiddleware.errorHandler);

  return app;
}
