import { Router, Request, Response, NextFunction } from "express";
import { register, login, logout, profile } from "@features/auth/auth.controller.js";
import { authenticate, requireAuth, type AuthenticatedRequest } from "@shared/middleware/index.js";

export const authRouter = Router();

authRouter.post(
    "/register",
    (req: Request, res: Response) => register(req as AuthenticatedRequest, res)
);
authRouter.post(
    "/login",
    (req: Request, res: Response) => login(req as AuthenticatedRequest, res)
);
authRouter.post(
    "/logout",
    (req: Request, res: Response, next: NextFunction) => authenticate(req as AuthenticatedRequest, res, next),
    (req: Request, res: Response, next: NextFunction) => requireAuth(req as AuthenticatedRequest, res, next),
    (req: Request, res: Response) => logout(req as AuthenticatedRequest, res)
);
authRouter.get(
    "/profile",
    (req: Request, res: Response, next: NextFunction) => authenticate(req as AuthenticatedRequest, res, next),
    (req: Request, res: Response, next: NextFunction) => requireAuth(req as AuthenticatedRequest, res, next),
    (req: Request, res: Response) => profile(req as AuthenticatedRequest, res)
);

