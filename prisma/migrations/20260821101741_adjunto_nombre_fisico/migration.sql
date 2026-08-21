/*
  Warnings:

  - Added the required column `nombreFisico` to the `Adjunto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Adjunto" ADD COLUMN     "nombreFisico" TEXT NOT NULL;
