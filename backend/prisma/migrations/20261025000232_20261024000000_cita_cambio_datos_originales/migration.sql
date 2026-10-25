-- AlterTable
ALTER TABLE "cita_cambios" ADD COLUMN     "fecha_inicio_original" TIMESTAMP(3),
ADD COLUMN     "lugar_original" TEXT,
ADD COLUMN     "modalidad_original" TEXT;
