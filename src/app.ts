import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import type { Express } from "express";

import { authenticate } from "@shared/middleware/auth.middleware.js";
import { authRouter } from "@features/auth/auth.route";
import { wilayahRouter } from "@features/wilayah/wilayah.route";
import { masjidRouter } from "@/features/masjid/masjid.route";

import { formatUptime } from "@shared/utils/formatUptime.js";
import { errorHandler, notFound } from "./shared/middleware/error-handling.middleware";

export function createApp(): Express {
  const app = express();

  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(authenticate);

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
  app.use("/masjid", masjidRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}