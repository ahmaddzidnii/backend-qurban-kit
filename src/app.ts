import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import type { Express } from "express";

import { authRouter } from "@features/auth/auth.route";
import { wilayahRouter } from "@features/wilayah/wilayah.route";

import {
  errorHandler,
  notFound,
} from "@shared/middleware/index.js";

import { formatUptime } from "@shared/utils/index.js";

export function createApp(): Express {
  const app = express();

  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    return res.json({
      name: "Qurban Kit Backend API",
      status: "HEALTHY",
      sysdate: new Date().toISOString(),
      uptime: formatUptime(process.uptime()),
    });
  });

  app.use("/auth", authRouter);
  app.use("/wilayah", wilayahRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}