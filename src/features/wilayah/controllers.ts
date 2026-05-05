import { z } from "zod";
import type { Response } from "express";

import { getWilayahQuerySchema } from "./dtos.js";
import { getWilayah } from "./services.js";
import type { AuthenticatedRequest } from "../../shared/middleware/index.js";

export async function getWilayahHandler(req: AuthenticatedRequest, res: Response) {
    const query = getWilayahQuerySchema.parse(req.query);
    const result = await getWilayah(query);
    return res.json(result);
}
