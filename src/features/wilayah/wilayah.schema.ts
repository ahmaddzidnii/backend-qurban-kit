import z from "zod";

export type WilayahLevel = "provinsi" | "kabupaten" | "kecamatan" | "desa";

export const wilayahLevels: WilayahLevel[] = [
    "provinsi",
    "kabupaten",
    "kecamatan",
    "desa",
];

export const getWilayahQuerySchema = z.object({
    level: z
        .string()
        .refine((val) => wilayahLevels.includes(val as WilayahLevel), {
            message: `Level must be one of: ${wilayahLevels.join(", ")}`,
        })
        .default("provinsi"),
    parent_id: z.string().optional(),
    search: z.string().optional(),
});