import type { Response } from "express";

import type { AuthenticatedRequest } from "@shared/middleware/index.js";
import { getWilayahQuerySchema } from "./wilayah.schema";
import { prisma } from "@/database";
import { InvalidWilayahLevelError, MissingWilayahParentIdError } from "@/shared/errors";

export async function getWilayahHandler(req: AuthenticatedRequest, res: Response) {
    const query = getWilayahQuerySchema.parse(req.query);
    const { level, parent_id, search } = query;

    let result;

    switch (level) {
        case "provinsi":
            result = await getProvinsi(search);
            break;
        case "kabupaten":
            if (!parent_id) {
                throw new MissingWilayahParentIdError("kabupaten");
            }
            result = await getKabupaten(parent_id, search);
            break;
        case "kecamatan":
            if (!parent_id) {
                throw new MissingWilayahParentIdError("kecamatan");
            }
            result = await getKecamatan(parent_id, search);
            break;
        case "desa":
            if (!parent_id) {
                throw new MissingWilayahParentIdError("desa");
            }
            result = await getDesa(parent_id, search);
            break;
        default:
            throw new InvalidWilayahLevelError(level);
    }

    return res.json(result);
}


async function getProvinsi(search?: string) {
    const where = search
        ? {
            nama: {
                contains: search,
                mode: "insensitive" as const,
            },
        }
        : undefined;

    const data = await prisma.provinsi.findMany({
        where,
        select: {
            id: true,
            nama: true,
        },
        orderBy: {
            nama: "asc",
        },
    });

    return data;
}

async function getKabupaten(
    parentId: string,
    search?: string
) {
    const where = {
        idProvinsi: parentId,
        ...(search && {
            nama: {
                contains: search,
                mode: "insensitive" as const,
            },
        }),
    };

    const data = await prisma.kabupaten.findMany({
        where,
        select: {
            id: true,
            nama: true,
        },
        orderBy: {
            nama: "asc",
        },
    });

    return data;
}

async function getKecamatan(
    parentId: string,
    search?: string
) {
    const where = {
        idKabupaten: parentId,
        ...(search && {
            nama: {
                contains: search,
                mode: "insensitive" as const,
            },
        }),
    };

    const data = await prisma.kecamatan.findMany({
        where,
        select: {
            id: true,
            nama: true,
        },
        orderBy: {
            nama: "asc",
        },
    });

    return data;
}

async function getDesa(
    parentId: string,
    search?: string
) {
    const where = {
        idKecamatan: parentId,
        ...(search && {
            nama: {
                contains: search,
                mode: "insensitive" as const,
            },
        }),
    };

    const data = await prisma.desa.findMany({
        where,
        select: {
            id: true,
            nama: true,
        },
        orderBy: {
            nama: "asc",
        },
    });

    return data;
}