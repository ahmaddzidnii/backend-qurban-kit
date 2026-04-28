import type { Response } from "express";
import { z } from "zod";
import type { AuthService } from "./services.js";
import type { AuthenticatedRequest } from "../../shared/middleware/index.js";

// Validation schemas
const registerSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

type AuthResponse =
    | {
        id: string;
        email: string;
        password?: undefined;
        fullName: string;
        createdAt: Date;
        updatedAt: Date;
    }
    | {
        user: {
            id: string;
            email: string;
            fullName: string;
        };
        accessToken: string;
    }
    | {
        message?: string;
        code?: string;
        errors?: Record<string, string[]>;
    }
    | {
        name: string;
        email: string;
        phone: string;
        address: string;
    };

export class AuthController {
    constructor(private authService: AuthService) { }

    async register(req: AuthenticatedRequest, res: Response) {
        try {
            const data = registerSchema.parse(req.body);
            const result = await this.authService.register(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMap: Record<string, string[]> = {};
                error.issues.forEach((issue) => {
                    const path = issue.path.join(".");
                    if (!errorMap[path]) {
                        errorMap[path] = [];
                    }
                    errorMap[path].push(issue.message);
                });
                res.status(400).json({
                    message: "Validation error",
                    code: "VALIDATION_ERROR",
                    errors: errorMap,
                });
            } else if (error instanceof Error) {
                throw error;
            }
        }
    }

    async login(req: AuthenticatedRequest, res: Response<AuthResponse>) {
        try {
            const data = loginSchema.parse(req.body);
            const result = await this.authService.login(data);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMap: Record<string, string[]> = {};
                error.issues.forEach((issue) => {
                    const path = issue.path.join(".");
                    if (!errorMap[path]) {
                        errorMap[path] = [];
                    }
                    errorMap[path].push(issue.message);
                });
                res.status(400).json({
                    message: "Validation error",
                    code: "VALIDATION_ERROR",
                    errors: errorMap,
                });
            } else if (error instanceof Error) {
                throw error;
            }
        }
    }

    async profile(req: AuthenticatedRequest, res: Response) {
        try {
            const result = await this.authService.getProfile();
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
        }
    }
}
