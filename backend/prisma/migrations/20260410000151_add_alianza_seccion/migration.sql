-- AlterTable
ALTER TABLE "secciones" ADD COLUMN     "id_alianza" INTEGER;

-- AddForeignKey
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_id_alianza_fkey" FOREIGN KEY ("id_alianza") REFERENCES "alianzas"("id_alianza") ON DELETE SET NULL ON UPDATE CASCADE;
