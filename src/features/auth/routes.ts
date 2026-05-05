import type { Router, Request, Response, NextFunction } from "express";
import { Router as ExpressRouter } from "express";
import { register, login, logout, profile } from "./controllers.js";
import { authenticate, requireAuth, type AuthenticatedRequest } from "../../shared/middleware/index.js";

export function createAuthRoutes(): Router {
    const router = ExpressRouter();

    router.post(
        "/register",
        (req: Request, res: Response) => register(req as AuthenticatedRequest, res)
    );
    router.post(
        "/login",
        (req: Request, res: Response) => login(req as AuthenticatedRequest, res)
    );
    router.post(
        "/logout",
        (req: Request, res: Response, next: NextFunction) => authenticate(req as AuthenticatedRequest, res, next),
        (req: Request, res: Response, next: NextFunction) => requireAuth(req as AuthenticatedRequest, res, next),
        (req: Request, res: Response) => logout(req as AuthenticatedRequest, res)
    );
    router.get(
        "/profile",
        (req: Request, res: Response, next: NextFunction) => authenticate(req as AuthenticatedRequest, res, next),
        (req: Request, res: Response, next: NextFunction) => requireAuth(req as AuthenticatedRequest, res, next),
        (req: Request, res: Response) => profile(req as AuthenticatedRequest, res)
    );

    return router;
}
