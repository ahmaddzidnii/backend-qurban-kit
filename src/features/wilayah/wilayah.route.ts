import { Router } from "express";

import { getWilayahHandler } from "./wilayah.controller.js";


export const wilayahRouter = Router();
wilayahRouter.get("/", getWilayahHandler);


