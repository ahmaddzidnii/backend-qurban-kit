import type { Router } from "express";
import { Router as ExpressRouter } from "express";
import { asyncHandler } from "../../utils/index.js";
import type { AuthController } from "../controllers/AuthController.js";
import type { AuthMiddleware } from "../middleware/AuthMiddleware.js";

export function createAuthRoutes(authController: AuthController, authMiddleware?: AuthMiddleware): Router {
  const router = ExpressRouter();

  router.post("/register", asyncHandler((req, res) => authController.register(req, res)));
  router.post("/login", asyncHandler((req, res) => authController.login(req, res)));

  return router;
}
