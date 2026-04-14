-- AlterTable
ALTER TABLE "producto" ADD COLUMN     "id_creador" INTEGER;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_creador_fkey" FOREIGN KEY ("id_creador") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
