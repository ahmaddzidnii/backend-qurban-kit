import type { Router, Request, Response, NextFunction } from "express";
import { Router as ExpressRouter } from "express";
import type { AuthController } from "./controllers.js";
import type { AuthMiddleware, AuthenticatedRequest } from "../../shared/middleware/index.js";
import { asyncHandler } from "../../shared/utils/index.js";

export function createAuthRoutes(
    authController: AuthController,
    authMiddleware?: AuthMiddleware
): Router {
    const router = ExpressRouter();

    router.post(
        "/register",
        asyncHandler((req: Request, res: Response) => authController.register(req as AuthenticatedRequest, res))
    );
    router.post(
        "/login",
        asyncHandler((req: Request, res: Response) => authController.login(req as AuthenticatedRequest, res))
    );
    router.post(
        "/logout",
        authMiddleware
            ? (req: Request, res: Response, next: NextFunction) => authMiddleware.requireAuth(req as AuthenticatedRequest, res, next)
            : (req: Request, res: Response, next: NextFunction) => next(),
        asyncHandler((req: Request, res: Response) => authController.logout(req as AuthenticatedRequest, res))
    );
    router.get(
        "/profile",
        authMiddleware
            ? (req: Request, res: Response, next: NextFunction) => authMiddleware.requireAuth(req as AuthenticatedRequest, res, next)
            : (req: Request, res: Response, next: NextFunction) => next(),
        asyncHandler((req: Request, res: Response) => authController.profile(req as AuthenticatedRequest, res))
    );

    return router;
}
