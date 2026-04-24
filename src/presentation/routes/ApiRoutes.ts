import type { Router } from "express";
import { Router as ExpressRouter } from "express";

import { formatUptime } from "../../utils";

export function createApiRoutes(authRouter: Router): Router {
  const router = ExpressRouter();

  router.get("/", (req, res) => {
    return res.json({
      name: "Qurban Kit Backend API",
      status: "HEALTHY",
      sysdate: new Date().toISOString(),
      uptime: formatUptime(process.uptime()),
    });

  });

  router.use("/auth", authRouter);

  return router;
}


