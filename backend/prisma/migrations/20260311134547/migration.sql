-- DropForeignKey
ALTER TABLE "inventario" DROP CONSTRAINT "inventario_id_producto_fkey";

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;
