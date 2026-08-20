-- AlterTable
ALTER TABLE "producto" ADD COLUMN     "categoria_destacado" TEXT,
ADD COLUMN     "fecha_decision" TIMESTAMP(3),
ADD COLUMN     "fecha_solicitud" TIMESTAMP(3),
ADD COLUMN     "solicitud_pendiente" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "configuracion_destacados" (
    "id" SERIAL NOT NULL,
    "dias_nuevo" INTEGER NOT NULL DEFAULT 7,
    "top_mas_vendidos" INTEGER NOT NULL DEFAULT 10,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_destacados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destacado_logs" (
    "id_log" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_usuario" INTEGER,
    "evento" TEXT NOT NULL,
    "detalle" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destacado_logs_pkey" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "destacado_eventos" (
    "id_evento" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destacado_eventos_pkey" PRIMARY KEY ("id_evento")
);

-- AddForeignKey
ALTER TABLE "destacado_logs" ADD CONSTRAINT "destacado_logs_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destacado_logs" ADD CONSTRAINT "destacado_logs_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destacado_eventos" ADD CONSTRAINT "destacado_eventos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;
