import { Router } from "express";

import { multerUpload } from "./masjid.middleware.js";
import { requireAuth } from "@shared/middleware/auth.middleware.js";
import { adminMasjidOnly, superAdminOnly } from "@shared/middleware/authorization.middleware.js";
import {
    approveMasjidRegistration,
    blokirMasjid,
    createMasjidRegistration,
    getAllMasjid,
    getMasjidRegistrations,
    getStatusPermintaanMasjid,
    rejectMasjidRegistration,
} from "./masjid.controller.js";

export const masjidRouter = Router();

masjidRouter.post(
    "/permintaan",
    requireAuth,
    adminMasjidOnly,
    multerUpload.fields([
        { name: "foto_masjid", maxCount: 1 },
        { name: "foto_dokumen_sk", maxCount: 1 },
    ]),
    createMasjidRegistration,
);

masjidRouter.get("/list-permintaan", requireAuth, superAdminOnly, getMasjidRegistrations);
masjidRouter.get("/permintaan/status", requireAuth, adminMasjidOnly, getStatusPermintaanMasjid);
masjidRouter.post("/permintaan/:id/approve", requireAuth, superAdminOnly, approveMasjidRegistration);
masjidRouter.post("/permintaan/:id/reject", requireAuth, superAdminOnly, rejectMasjidRegistration);


masjidRouter.post("/:id/blokir", requireAuth, superAdminOnly, blokirMasjid);


masjidRouter.get("/", requireAuth, superAdminOnly, getAllMasjid);