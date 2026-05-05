// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { Pool } from 'pg';
// import fs from 'fs';
// import path from 'path';
// import csv from 'csv-parser';

// interface WilayahRow {
//     prov_id: string;
//     prov_name: string;
//     city_id: string;
//     city_name: string;
//     dis_id: string;
//     dis_name: string;
//     subdis_id: string;
//     subdis_name: string;
//     postal_code: string;
// }

// const connectionString = process.env.DATABASE_URL;
// const pool = new Pool({ connectionString });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// async function main() {
//     console.log('Mulai proses ekstraksi dan seeding wilayah dari CSV... 🚀');

//     const provinsiMap = new Map();
//     const kabupatenMap = new Map();
//     const kecamatanMap = new Map();
//     const desaMap = new Map();

//     console.log('1. Membaca file CSV dan mengekstrak data unik...');

//     // Path ke file CSV kamu
//     const csvFilePath = path.resolve(__dirname, '../data/data_wilayah_indonesia.csv');

//     // Membaca CSV secara Asynchronous
//     await new Promise<void>((resolve, reject) => {
//         fs.createReadStream(csvFilePath)
//             .pipe(csv())
//             .on('data', (row: WilayahRow) => {
//                 // Ekstrak Provinsi
//                 if (!provinsiMap.has(row.prov_id)) {
//                     provinsiMap.set(row.prov_id, {
//                         nama: row.prov_name,
//                     });
//                 }

//                 // Ekstrak Kabupaten (simpan referensi ID dari CSV)
//                 if (!kabupatenMap.has(row.city_id)) {
//                     kabupatenMap.set(row.city_id, {
//                         nama: row.city_name,
//                         prov_id: row.prov_id,
//                     });
//                 }

//                 // Ekstrak Kecamatan (simpan referensi ID dari CSV)
//                 if (!kecamatanMap.has(row.dis_id)) {
//                     kecamatanMap.set(row.dis_id, {
//                         nama: row.dis_name,
//                         city_id: row.city_id,
//                     });
//                 }

//                 // Ekstrak Desa (simpan referensi ID dari CSV)
//                 if (!desaMap.has(row.subdis_id)) {
//                     desaMap.set(row.subdis_id, {
//                         nama: row.subdis_name,
//                         kodePos: row.postal_code,
//                         dis_id: row.dis_id,
//                     });
//                 }
//             })
//             .on('end', () => {
//                 console.log('Selesai membaca file CSV.');
//                 resolve();
//             })
//             .on('error', (error: Error) => {
//                 reject(error);
//             });
//     });

//     console.log(`\nBerhasil mengekstrak:`);
//     console.log(`- ${provinsiMap.size} Provinsi`);
//     console.log(`- ${kabupatenMap.size} Kabupaten`);
//     console.log(`- ${kecamatanMap.size} Kecamatan`);
//     console.log(`- ${desaMap.size} Desa`);

//     console.log('\n2. Memulai proses Insert ke Database...');

//     // Mapping untuk menyimpan relasi ID CSV ke Prisma ID
//     const provinsiIdMap = new Map<string, string>();
//     const kabupatenIdMap = new Map<string, string>();
//     const kecamatanIdMap = new Map<string, string>();

//     // Insert Provinsi
//     console.log('Menyimpan Provinsi...');
//     for (const [csvId, data] of provinsiMap) {
//         const created = await prisma.provinsi.create({ data });
//         provinsiIdMap.set(csvId, created.id);
//     }
//     console.log(`✓ ${provinsiMap.size} Provinsi tersimpan`);

//     // Insert Kabupaten dengan foreign key yang benar
//     console.log('Menyimpan Kabupaten...');
//     let kabupatenSuccess = 0;
//     for (const [csvId, data] of kabupatenMap) {
//         const idProvinsi = provinsiIdMap.get(data.prov_id);
//         if (idProvinsi) {
//             const created = await prisma.kabupaten.create({
//                 data: {
//                     nama: data.nama,
//                     idProvinsi,
//                 },
//             });
//             kabupatenIdMap.set(csvId, created.id);
//             kabupatenSuccess++;
//         }
//     }
//     console.log(`✓ ${kabupatenSuccess} Kabupaten tersimpan`);

//     // Insert Kecamatan dengan foreign key yang benar
//     console.log('Menyimpan Kecamatan...');
//     let kecamatanSuccess = 0;
//     for (const [csvId, data] of kecamatanMap) {
//         const idKabupaten = kabupatenIdMap.get(data.city_id);
//         if (idKabupaten) {
//             const created = await prisma.kecamatan.create({
//                 data: {
//                     nama: data.nama,
//                     idKabupaten,
//                 },
//             });
//             kecamatanIdMap.set(csvId, created.id);
//             kecamatanSuccess++;
//         }
//     }
//     console.log(`✓ ${kecamatanSuccess} Kecamatan tersimpan`);

//     // Insert Desa dengan foreign key yang benar
//     console.log('Menyimpan Desa... (Mohon tunggu, ini tabel terbesar)');
//     let desaSuccess = 0;
//     for (const [csvId, data] of desaMap) {
//         const idKecamatan = kecamatanIdMap.get(data.dis_id);
//         if (idKecamatan) {
//             await prisma.desa.create({
//                 data: {
//                     nama: data.nama,
//                     kodePos: data.kodePos,
//                     idKecamatan,
//                 },
//             });
//             desaSuccess++;
//         }
//     }
//     console.log(`✓ ${desaSuccess} Desa tersimpan`);

//     console.log('✅ Seeding wilayah selesai dengan sukses!');
// }

// main()
//     .catch((e) => {
//         console.error('Terjadi kesalahan saat seeding:', e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//         await pool.end();
//     });


import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface WilayahRow {
    prov_id: string;
    prov_name: string;
    city_id: string;
    city_name: string;
    dis_id: string;
    dis_name: string;
    subdis_id: string;
    subdis_name: string;
    postal_code: string;
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter,
    log: ['error'],
});


function chunkArray<T>(array: T[], size: number) {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

async function main() {
    console.log('🚀 Mulai seeding cepat...');

    const provinsiMap = new Map();
    const kabupatenMap = new Map();
    const kecamatanMap = new Map();
    const desaMap = new Map();

    const csvFilePath = path.resolve(__dirname, '../data/data_wilayah_indonesia_36prov.csv');

    // ===== READ CSV =====
    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row: WilayahRow) => {
                if (!provinsiMap.has(row.prov_id)) {
                    provinsiMap.set(row.prov_id, { nama: row.prov_name });
                }

                if (!kabupatenMap.has(row.city_id)) {
                    kabupatenMap.set(row.city_id, {
                        nama: row.city_name,
                        prov_id: row.prov_id,
                    });
                }

                if (!kecamatanMap.has(row.dis_id)) {
                    kecamatanMap.set(row.dis_id, {
                        nama: row.dis_name,
                        city_id: row.city_id,
                    });
                }

                if (!desaMap.has(row.subdis_id)) {
                    desaMap.set(row.subdis_id, {
                        nama: row.subdis_name,
                        kodePos: row.postal_code,
                        dis_id: row.dis_id,
                    });
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log('✅ CSV Loaded');
    // ===== INSERT PROVINSI =====
    await prisma.provinsi.createMany({
        data: Array.from(provinsiMap.entries()).map(([kode, val]) => ({
            kode,
            nama: val.nama,
        })),
        skipDuplicates: true,
    });

    const provinsiIdMap = new Map(
        (await prisma.provinsi.findMany())
            .map(p => [p.kode, p.id])
    );

    console.log('✅ Provinsi done');


    // ===== INSERT KABUPATEN =====
    const kabupatenData = [];

    for (const [kode, data] of kabupatenMap) {
        const idProvinsi = provinsiIdMap.get(data.prov_id);

        if (idProvinsi) {
            kabupatenData.push({
                kode,
                nama: data.nama,
                idProvinsi,
            });
        }
    }

    for (const chunk of chunkArray(kabupatenData, 1000)) {
        await prisma.kabupaten.createMany({
            data: chunk,
            skipDuplicates: true,
        });
    }

    const kabupatenIdMap = new Map(
        (await prisma.kabupaten.findMany())
            .map(k => [k.kode, k.id])
    );

    console.log('✅ Kabupaten done');


    // ===== INSERT KECAMATAN =====
    const kecamatanData = [];

    for (const [kode, data] of kecamatanMap) {
        const idKabupaten = kabupatenIdMap.get(data.city_id);

        if (idKabupaten) {
            kecamatanData.push({
                kode,
                nama: data.nama,
                idKabupaten,
            });
        }
    }

    for (const chunk of chunkArray(kecamatanData, 1000)) {
        await prisma.kecamatan.createMany({
            data: chunk,
            skipDuplicates: true,
        });
    }

    const kecamatanIdMap = new Map(
        (await prisma.kecamatan.findMany())
            .map(k => [k.kode, k.id])
    );

    console.log('✅ Kecamatan done');


    // ===== INSERT DESA =====
    const desaData = [];

    for (const [kode, data] of desaMap) {
        const idKecamatan = kecamatanIdMap.get(data.dis_id);

        if (idKecamatan) {
            desaData.push({
                kode,
                nama: data.nama,
                kodePos: data.kodePos,
                idKecamatan,
            });
        }
    }

    for (const chunk of chunkArray(desaData, 1000)) {
        await prisma.desa.createMany({
            data: chunk,
            skipDuplicates: true,
        });
    }

    console.log('SELESAI!');

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
