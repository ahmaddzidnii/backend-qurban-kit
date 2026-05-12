import { prisma } from "../../database.js";
import type { GetWilayahQueryDTO } from "./dtos.js";
import { InvalidWilayahLevelError, MissingWilayahParentIdError } from "../../shared/errors/index.js";

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

export async function getWilayah(
    query: GetWilayahQueryDTO
) {
    const { level, parent_id, search } = query;

    switch (level) {
        case "provinsi":
            return getProvinsi(search);
        case "kabupaten":
            if (!parent_id) {
                throw new MissingWilayahParentIdError("kabupaten");
            }
            return getKabupaten(parent_id, search);
        case "kecamatan":
            if (!parent_id) {
                throw new MissingWilayahParentIdError("kecamatan");
            }
            return getKecamatan(parent_id, search);
        case "desa":
            if (!parent_id) {
                throw new MissingWilayahParentIdError("desa");
            }
            return getDesa(parent_id, search);
        default:
            throw new InvalidWilayahLevelError(level);
    }
}
