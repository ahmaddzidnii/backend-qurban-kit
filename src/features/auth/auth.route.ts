import { Router } from "express";
import { register, login, logout, profile } from "@features/auth/auth.controller.js";
import { requireAuth } from "@shared/middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

authRouter.post("/logout", requireAuth, logout);
authRouter.get("/profile", requireAuth, profile);

