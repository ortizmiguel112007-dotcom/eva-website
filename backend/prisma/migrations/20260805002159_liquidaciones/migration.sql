-- CreateTable
CREATE TABLE "liquidaciones" (
    "id_liquidacion" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_emprendedora" INTEGER NOT NULL,
    "monto" DECIMAL(10,3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fecha_generada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_pagado" TIMESTAMP(3),
    "nota" TEXT,

    CONSTRAINT "liquidaciones_pkey" PRIMARY KEY ("id_liquidacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "liquidaciones_id_pedido_key" ON "liquidaciones"("id_pedido");

-- AddForeignKey
ALTER TABLE "liquidaciones" ADD CONSTRAINT "liquidaciones_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidaciones" ADD CONSTRAINT "liquidaciones_id_emprendedora_fkey" FOREIGN KEY ("id_emprendedora") REFERENCES "emprendedoras"("id_emprendedora") ON DELETE RESTRICT ON UPDATE CASCADE;
