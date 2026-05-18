import z from "zod";

export const createMasjidSchema = z.object({
    body: z.object({
        nama: z.string()
            .min(1, "Nama masjid tidak boleh kosong")
            .min(3, "Nama masjid minimal 3 karakter")
            .max(255, "Nama masjid maksimal 255 karakter"),

        nomor_sk: z.string()
            .min(1, "Nomor SK tidak boleh kosong"),

        id_desa: z.string()
            .min(1, "ID Desa tidak boleh kosong")
            .cuid("ID Desa harus valid CUID"),

        alamat: z.string()
            .min(1, "Alamat tidak boleh kosong")
            .min(10, "Alamat minimal 10 karakter")
            .max(500, "Alamat maksimal 500 karakter"),
    }),
});

export type CreateMasjidRequest = z.infer<typeof createMasjidSchema>;
