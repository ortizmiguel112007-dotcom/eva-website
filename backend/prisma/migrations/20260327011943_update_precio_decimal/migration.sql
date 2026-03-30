/*
  Warnings:

  - You are about to alter the column `precio` on the `producto` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,3)` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE "producto" ALTER COLUMN "precio" SET DATA TYPE DECIMAL(15,2);
