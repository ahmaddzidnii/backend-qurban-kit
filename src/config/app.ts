import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";
import type { Express } from "express";
import { Router as ExpressRouter } from "express";

import { formatUptime } from "../shared/utils/index.js";
import { createAuthRoutes } from "../features/auth/routes.js";
import { createWilayahRoutes } from "../features/wilayah/routes.js";
import { notFound, errorHandler } from "../shared/middleware/index.js";

export function createApp(): Express {
  const app = express();

  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const apiRouter = ExpressRouter();

  apiRouter.get("/", (req, res) => {
    return res.json({
      name: "Qurban Kit Backend API",
      status: "HEALTHY",
      sysdate: new Date().toISOString(),
      uptime: formatUptime(process.uptime()),
    });
  });

  const authRoutes = createAuthRoutes();
  const wilayahRoutes = createWilayahRoutes();

  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/wilayah", wilayahRoutes);

  app.use("/", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
