/*
  Warnings:

  - Added the required column `telefono` to the `VerificacionPendiente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificacionPendiente" ADD COLUMN     "telefono" TEXT NOT NULL;
