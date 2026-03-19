-- AlterTable
ALTER TABLE "User" ADD COLUMN     "foto_documento" TEXT;

-- AlterTable
ALTER TABLE "VerificacionPendiente" ADD COLUMN     "foto_documento" TEXT,
ADD COLUMN     "rol" TEXT NOT NULL DEFAULT 'usuario';
