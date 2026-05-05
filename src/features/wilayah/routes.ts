import type { Router } from "express";
import { Router as ExpressRouter } from "express";

import { WilayahService } from "./services.js";
import { WilayahController } from "./controllers.js";

export function createWilayahRoutes(): Router {
    const router = ExpressRouter();
    const wilayahService = new WilayahService();
    const wilayahController = new WilayahController(wilayahService);

    router.get("/", (req, res) => {
        wilayahController.getWilayah(req, res);
    });

    return router;
}
