import type { Router } from "express";
import { Router as ExpressRouter } from "express";

import { getWilayahHandler } from "./controllers.js";

export function createWilayahRoutes(): Router {
    const router = ExpressRouter();

    router.get(
        "/",
        (req, res) => getWilayahHandler(req, res)
    );

    return router;
}
