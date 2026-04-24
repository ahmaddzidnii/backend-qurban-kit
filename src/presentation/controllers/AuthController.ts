import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/AuthMiddleware.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/AuthValidator.js";
import type { RegisterUseCase } from "../../application/use-cases/auth/RegisterUseCase.js";
import type { LoginUseCase } from "../../application/use-cases/auth/LoginUseCase.js";
import { ValidationError } from "../../domain/errors/DomainError.js";
import type { AuthResponseDTO } from "../../application/dto/AuthDTO.js";

type AuthResponse = AuthResponseDTO | {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
};

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
  ) {}

  async register(req: AuthenticatedRequest, res: Response<AuthResponse>) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await this.registerUseCase.execute(data);
      res.status(201).json(result);
    }
    catch (error) {
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
      }
      else if (error instanceof Error) {
        throw error;
      }
    }
  }

  async login(req: AuthenticatedRequest, res: Response<AuthResponse>) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute(data);
      res.status(200).json(result);
    }
    catch (error) {
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
      }
      else if (error instanceof Error) {
        throw error;
      }
    }
  }
}
