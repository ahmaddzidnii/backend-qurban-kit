import { Router } from "express";
import { register, login, logout, profile } from "@features/auth/auth.controller.js";
import { authenticate, requireAuth } from "@/shared/middleware/auth.middleware";

export const authRouter = Router();

authRouter.use(authenticate);

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", requireAuth, logout);
authRouter.get("/profile", requireAuth, profile);

