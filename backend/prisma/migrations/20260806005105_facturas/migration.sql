-- CreateTable
CREATE TABLE "facturas" (
    "id_factura" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "url_pdf" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota_regeneracion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateIndex
CREATE UNIQUE INDEX "facturas_id_pedido_key" ON "facturas"("id_pedido");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numero_key" ON "facturas"("numero");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;
