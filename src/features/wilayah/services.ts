import type { GetWilayahQueryDTO } from "./dtos.js";
import { prisma } from "../../config/database.js";

export class WilayahService {
    async getWilayah(
        query: GetWilayahQueryDTO
    ) {
        const { level, parent_id, search } = query;

        switch (level) {
            case "provinsi":
                return this.getProvinsi(search);
            case "kabupaten":
                if (!parent_id) {
                    throw new Error("parent_id is required for kabupaten level");
                }
                return this.getKabupaten(parent_id, search);
            case "kecamatan":
                if (!parent_id) {
                    throw new Error(
                        "parent_id is required for kecamatan level"
                    );
                }
                return this.getKecamatan(parent_id, search);
            case "desa":
                if (!parent_id) {
                    throw new Error("parent_id is required for desa level");
                }
                return this.getDesa(parent_id, search);
            default:
                throw new Error(`Invalid level: ${level}`);
        }
    }

    private async getProvinsi(search?: string) {
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

    private async getKabupaten(
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

    private async getKecamatan(
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

    private async getDesa(
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
}
