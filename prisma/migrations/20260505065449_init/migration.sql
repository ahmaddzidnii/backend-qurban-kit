-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN_MASJID');

-- CreateEnum
CREATE TYPE "MasjidStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_masjid" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masjid" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nomor_sk" TEXT NOT NULL,
    "foto_masjid_url" TEXT,
    "foto_sk_url" TEXT,
    "alamat" TEXT NOT NULL,
    "status" "MasjidStatus" NOT NULL DEFAULT 'PENDING',
    "catatan_admin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_desa" TEXT NOT NULL,

    CONSTRAINT "masjid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinsi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "provinsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kabupaten" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "id_provinsi" TEXT NOT NULL,

    CONSTRAINT "kabupaten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kecamatan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "id_kabupaten" TEXT NOT NULL,

    CONSTRAINT "kecamatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode_pos" TEXT,
    "id_kecamatan" TEXT NOT NULL,

    CONSTRAINT "desa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_masjid_key" ON "users"("id_masjid");

-- CreateIndex
CREATE UNIQUE INDEX "user_tokens_token_key" ON "user_tokens"("token");

-- CreateIndex
CREATE INDEX "user_tokens_user_id_idx" ON "user_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "masjid_nomor_sk_key" ON "masjid"("nomor_sk");

-- CreateIndex
CREATE INDEX "masjid_id_desa_status_idx" ON "masjid"("id_desa", "status");

-- CreateIndex
CREATE INDEX "kabupaten_id_provinsi_idx" ON "kabupaten"("id_provinsi");

-- CreateIndex
CREATE INDEX "kecamatan_id_kabupaten_idx" ON "kecamatan"("id_kabupaten");

-- CreateIndex
CREATE INDEX "desa_id_kecamatan_idx" ON "desa"("id_kecamatan");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_masjid_fkey" FOREIGN KEY ("id_masjid") REFERENCES "masjid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masjid" ADD CONSTRAINT "masjid_id_desa_fkey" FOREIGN KEY ("id_desa") REFERENCES "desa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kabupaten" ADD CONSTRAINT "kabupaten_id_provinsi_fkey" FOREIGN KEY ("id_provinsi") REFERENCES "provinsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kecamatan" ADD CONSTRAINT "kecamatan_id_kabupaten_fkey" FOREIGN KEY ("id_kabupaten") REFERENCES "kabupaten"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desa" ADD CONSTRAINT "desa_id_kecamatan_fkey" FOREIGN KEY ("id_kecamatan") REFERENCES "kecamatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
