import { z } from "zod";
import type { Response } from "express";

import { getWilayahQuerySchema } from "./dtos.js";
import type { WilayahService } from "./services.js";
import type { AuthenticatedRequest } from "../../shared/middleware/index.js";

export class WilayahController {
    constructor(private wilayahService: WilayahService) { }

    async getWilayah(req: AuthenticatedRequest, res: Response) {
        try {
            const query = getWilayahQuerySchema.parse(req.query);
            const result = await this.wilayahService.getWilayah(query);
            return res.json(result);
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
                res.status(400).json({
                    message: error.message,
                    code: "BAD_REQUEST",
                });
            } else {
                throw error;
            }
        }
    }
}
