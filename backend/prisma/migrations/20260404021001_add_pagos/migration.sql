-- CreateTable
CREATE TABLE "pagos" (
    "id_pago" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "metodo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "comprobante" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_verif" TIMESTAMP(3),
    "nota_rechazo" TEXT,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "pagos_id_pedido_key" ON "pagos"("id_pedido");

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;
