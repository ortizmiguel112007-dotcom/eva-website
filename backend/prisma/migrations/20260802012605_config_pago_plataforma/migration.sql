-- CreateTable
CREATE TABLE "pago_logs" (
    "id_log" SERIAL NOT NULL,
    "id_pago" INTEGER,
    "id_usuario" INTEGER,
    "evento" TEXT NOT NULL,
    "detalle" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pago_logs_pkey" PRIMARY KEY ("id_log")
);

-- AddForeignKey
ALTER TABLE "pago_logs" ADD CONSTRAINT "pago_logs_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pagos"("id_pago") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago_logs" ADD CONSTRAINT "pago_logs_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
