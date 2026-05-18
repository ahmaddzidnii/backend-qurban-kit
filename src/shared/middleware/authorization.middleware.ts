import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import { InvalidTokenError } from "../errors/auth.error.js";
import { AdminMasjidOnlyError, SuperAdminOnlyError } from "../errors/authorization.error.js";


export function superAdminOnly(req: Request, _res: Response, next: NextFunction) {
    if (!req.auth) {
        throw new InvalidTokenError();
    }

    if (req.auth.user.role !== Role.SUPER_ADMIN) {
        throw new SuperAdminOnlyError();
    }

    next();
}

export const adminMasjidOnly = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
        throw new InvalidTokenError();
    }

    if (req.auth.user.role !== Role.ADMIN_MASJID) {
        throw new AdminMasjidOnlyError();
    }

    next();
}