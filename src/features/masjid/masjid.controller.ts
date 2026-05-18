import { uploadFile } from "@/s3";
import type { Request } from "express";
import type { NextFunction, Response } from "express";

import { prisma } from "@/database";
import { AppError } from "@shared/errors/app.error.js";
import { NotFoundError } from "@shared/errors/not-found.error.js";

import { createMasjidSchema } from "./masjid.schema.js";

class DuplicateNomorSKError extends AppError {
    constructor(nomorSK: string) {
        super({
            statusCode: 409,
            code: "DUPLICATE_NOMOR_SK",
            message: `Nomor SK '${nomorSK}' sudah terdaftar atau diajukan oleh administrator lain`,
        });
    }
}

export async function createMasjidRegistration(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        // Validate request data including files
        const validationResult = createMasjidSchema.safeParse({
            body: req.body,
        });

        if (!validationResult.success) {
            throw validationResult.error;
        }

        const { body } = validationResult.data;

        // Check if user has already submitted a registration or has an approved masjid
        const existingMasjidForUser = await prisma.masjid.findFirst({
            where: {
                user: {
                    id: req.auth?.user.id,
                },
            }

        });

        if (existingMasjidForUser) {
            throw new AppError({
                statusCode: 400,
                code: "USER_ALREADY_HAS_MASJID",
                message: "Anda sudah memiliki pendaftaran masjid yang sedang diproses atau sudah disetujui",
            });
        }

        // Check if nomor_sk already exists
        const existingMasjid = await prisma.masjid.findUnique({
            where: { nomorSK: body.nomor_sk },
        });

        if (existingMasjid) {
            throw new DuplicateNomorSKError(body.nomor_sk);
        }

        // Verify id_desa exists
        const desaExists = await prisma.desa.findUnique({
            where: { id: body.id_desa },
        });

        if (!desaExists) {
            throw new NotFoundError(`Desa dengan ID '${body.id_desa}' tidak ditemukan`);
        }


        const files = req.files as {
            foto_masjid?: Express.Multer.File[];
            foto_dokumen_sk?: Express.Multer.File[];
        };

        if (!files.foto_masjid?.length) {
            throw new AppError({
                statusCode: 400,
                code: "FILE_REQUIRED",
                message: "Foto masjid wajib diupload",
            });
        }

        if (!files.foto_dokumen_sk?.length) {
            throw new AppError({
                statusCode: 400,
                code: "FILE_REQUIRED",
                message: "Dokumen SK wajib diupload",
            });
        }


        const fotoMasjidFile = files.foto_masjid[0];
        const fotoDokumenSKFile = files.foto_dokumen_sk[0];

        const allowedImageMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedImageMimeTypes.includes(fotoMasjidFile.mimetype)) {
            throw new AppError({
                statusCode: 400,
                code: "INVALID_FILE",
                message: "Format foto masjid tidak valid",
            });
        }

        // Generate unique file paths
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);

        const fotoMasjidPath = `masjid/${body.id_desa}/${timestamp}-${randomString}-${fotoMasjidFile.originalname}`;
        const fotoDokumenSKPath = `masjid/${body.id_desa}/${timestamp}-${randomString}-dokumen-${fotoDokumenSKFile.originalname}`;

        // Upload files
        await Promise.all([
            uploadFile(fotoMasjidPath, fotoMasjidFile.buffer, fotoMasjidFile.mimetype),
            uploadFile(fotoDokumenSKPath, fotoDokumenSKFile.buffer, fotoDokumenSKFile.mimetype),
        ]);

        // Create Masjid record in database
        const newMasjid = await prisma.masjid.create({
            data: {
                nama: body.nama,
                nomorSK: body.nomor_sk,
                alamat: body.alamat,
                idDesa: body.id_desa,
                fotoMasjidUrl: fotoMasjidPath,
                fotoDokumenSKUrl: fotoDokumenSKPath,
                status: "PENDING",
                user: {
                    connect: {
                        id: req.auth?.user.id,
                    }
                }
            },
        });

        res.status(201).json({
            id: newMasjid.id,
            nama: newMasjid.nama,
            nomorSK: newMasjid.nomorSK,
            alamat: newMasjid.alamat,
            idDesa: newMasjid.idDesa,
            status: newMasjid.status,
            createdAt: newMasjid.createdAt,
        }
        );
    }
    catch (error) {
        next(error);
    }
}

export async function getMasjidRegistrations(
    req: Request,
    res: Response,
) {
    const masjidRegistrations = await prisma.masjid.findMany({
        where: {
            status: "PENDING",
        },
        select: {
            id: true,
            nama: true,
            nomorSK: true,
            alamat: true,
            desa: {
                select: {
                    nama: true,
                    kodePos: true,
                    kecamatan: {
                        select: {
                            nama: true,
                            kabupaten: {
                                select: {
                                    nama: true,
                                    provinsi: {
                                        select: {
                                            nama: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            status: true,
            createdAt: true,
        },
    });

    const formattedRegistrations = masjidRegistrations.map((masjid) => {
        const desa = masjid.desa;
        const kecamatan = desa?.kecamatan;
        const kabupaten = kecamatan?.kabupaten;
        const provinsi = kabupaten?.provinsi;

        return {
            id: masjid.id,
            nama: masjid.nama,
            nomorSK: masjid.nomorSK,
            alamat: masjid.alamat,
            status: masjid.status,
            createdAt: masjid.createdAt,
            detailWilayah: {
                kodePos: desa?.kodePos || null,
                desa: desa?.nama || null,
                kecamatan: kecamatan?.nama || null,
                kabupaten: kabupaten?.nama || null,
                provinsi: provinsi?.nama || null
            }
        };
    });

    res.status(200).json(formattedRegistrations);
}

export async function approveMasjidRegistration(
    req: Request,
    res: Response,
) {
    const { id } = req.params;

    const masjid = await prisma.masjid.findUnique({
        where: { id: id as string },
    });

    if (!masjid) {
        throw new NotFoundError(`Pendaftaran masjid dengan ID '${id}' tidak ditemukan`);
    }

    await prisma.masjid.update({
        where: { id: id as string },
        data: {
            status: "APPROVED",
        },
    });

    return res.status(200).json({
        message: "Pendaftaran masjid berhasil disetujui",
    });
}

export const rejectMasjidRegistration = async (
    req: Request,
    res: Response,
) => {
    const { id } = req.params;
    const masjid = await prisma.masjid.findUnique({
        where: { id: id as string },
    });

    if (!masjid) {
        throw new NotFoundError(`Pendaftaran masjid dengan ID '${id}' tidak ditemukan`);
    }

    await prisma.masjid.update({
        where: { id: id as string },
        data: {
            status: "REJECTED",
        },
    });

    return res.status(200).json({
        message: "Pendaftaran masjid berhasil ditolak",
    });
}

export const blokirMasjid = async (
    req: Request,
    res: Response,

) => {
    const { id } = req.params;
    const masjid = await prisma.masjid.findUnique({
        where: { id: id as string },
    });

    if (!masjid) {
        throw new NotFoundError(`Masjid dengan ID '${id}' tidak ditemukan`);
    }

    await prisma.masjid.update({
        where: { id: id as string },
        data: {
            status: "SUSPENDED",
        },
    });

    return res.status(200).json({
        message: "Masjid berhasil diblokir",
    });
}

export const getAllMasjid = async (
    req: Request,
    res: Response,
) => {
    const masjids = await prisma.masjid.findMany({
        where: {
            status: "APPROVED",
        },
        select: {
            id: true,
            nama: true,
            nomorSK: true,
            alamat: true,
            desa: {
                select: {
                    nama: true,
                    kodePos: true,
                    kecamatan: {
                        select: {
                            nama: true,
                            kabupaten: {
                                select: {
                                    nama: true,
                                    provinsi: {
                                        select: {
                                            nama: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            status: true,
            createdAt: true,
        },
    });

    const formattedMasjids = masjids.map((masjid) => {
        const desa = masjid.desa;
        const kecamatan = desa?.kecamatan;
        const kabupaten = kecamatan?.kabupaten;
        const provinsi = kabupaten?.provinsi;

        return {
            id: masjid.id,
            nama: masjid.nama,
            nomorSK: masjid.nomorSK,
            alamat: masjid.alamat,
            status: masjid.status,
            createdAt: masjid.createdAt,
            detailWilayah: {
                kodePos: desa?.kodePos || null,
                desa: desa?.nama || null,
                kecamatan: kecamatan?.nama || null,
                kabupaten: kabupaten?.nama || null,
                provinsi: provinsi?.nama || null
            }
        };
    });

    res.status(200).json(formattedMasjids);
}

export const getStatusPermintaanMasjid = async (
    req: Request,
    res: Response,
) => {
    const userId = req.auth?.user.id;
    const masjid = await prisma.masjid.findFirst({
        where: {
            user: {
                id: userId,
            },
        },
        select: {
            status: true,
        }
    });

    if (!masjid) {
        throw new NotFoundError("Anda belum mengajukan pendaftaran masjid");
    }
    res.status(200).json({
        status: masjid.status,
    });
}

