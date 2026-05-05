import type { Response } from "express";
import { z } from "zod";
import { registerUser, loginUser, logoutUser, getUserProfile } from "./services.js";
import type { AuthenticatedRequest } from "../../shared/middleware/index.js";

const registerSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export async function register(req: AuthenticatedRequest, res: Response) {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);
    res.status(201).json(result);
}

export async function login(req: AuthenticatedRequest, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    res.status(200).json(result);
}

export async function profile(req: AuthenticatedRequest, res: Response) {
    const result = await getUserProfile(req.userId);
    res.status(200).json(result);
}

export async function logout(req: AuthenticatedRequest, res: Response) {
    await logoutUser(req.token!);
    res.status(200).json({ message: "Logged out successfully" });
}
