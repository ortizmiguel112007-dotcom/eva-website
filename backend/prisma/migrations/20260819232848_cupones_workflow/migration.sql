-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "descuento_cupon" DECIMAL(10,3),
ADD COLUMN     "id_cupon" INTEGER;

-- CreateTable
CREATE TABLE "cupon_usos" (
    "id_uso" SERIAL NOT NULL,
    "id_cupon" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "monto_descuento" DECIMAL(10,3) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cupon_usos_pkey" PRIMARY KEY ("id_uso")
);

-- CreateIndex
CREATE UNIQUE INDEX "cupon_usos_id_pedido_key" ON "cupon_usos"("id_pedido");

-- AddForeignKey
ALTER TABLE "cupon_usos" ADD CONSTRAINT "cupon_usos_id_cupon_fkey" FOREIGN KEY ("id_cupon") REFERENCES "cupones"("id_cupon") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupon_usos" ADD CONSTRAINT "cupon_usos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupon_usos" ADD CONSTRAINT "cupon_usos_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;
