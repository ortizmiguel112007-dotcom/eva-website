-- CreateTable
CREATE TABLE "disponibilidades" (
    "id_disponibilidad" SERIAL NOT NULL,
    "id_emprendedora" INTEGER NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL DEFAULT 'presencial',
    "lugar" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disponibilidades_pkey" PRIMARY KEY ("id_disponibilidad")
);

-- CreateTable
CREATE TABLE "citas" (
    "id_cita" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_emprendedora" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "modalidad" TEXT NOT NULL,
    "lugar" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "motivo_rechazo" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id_cita")
);

-- CreateTable
CREATE TABLE "cita_mensajes" (
    "id_mensaje" SERIAL NOT NULL,
    "id_cita" INTEGER NOT NULL,
    "id_remitente" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cita_mensajes_pkey" PRIMARY KEY ("id_mensaje")
);

-- CreateTable
CREATE TABLE "cita_cambios" (
    "id_cambio" SERIAL NOT NULL,
    "id_cita" INTEGER NOT NULL,
    "id_proponente" INTEGER NOT NULL,
    "fecha_inicio_propuesta" TIMESTAMP(3) NOT NULL,
    "fecha_fin_propuesta" TIMESTAMP(3) NOT NULL,
    "modalidad_propuesta" TEXT NOT NULL,
    "lugar_propuesto" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "respuesta" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_respuesta" TIMESTAMP(3),

    CONSTRAINT "cita_cambios_pkey" PRIMARY KEY ("id_cambio")
);

-- CreateIndex
CREATE INDEX "disponibilidades_id_emprendedora_dia_semana_activa_idx" ON "disponibilidades"("id_emprendedora", "dia_semana", "activa");

-- CreateIndex
CREATE INDEX "citas_id_cliente_estado_idx" ON "citas"("id_cliente", "estado");

-- CreateIndex
CREATE INDEX "citas_id_emprendedora_fecha_inicio_idx" ON "citas"("id_emprendedora", "fecha_inicio");

-- CreateIndex
CREATE INDEX "citas_id_producto_fecha_inicio_idx" ON "citas"("id_producto", "fecha_inicio");

-- CreateIndex
CREATE INDEX "cita_mensajes_id_cita_fecha_idx" ON "cita_mensajes"("id_cita", "fecha");

-- CreateIndex
CREATE INDEX "cita_cambios_id_cita_estado_idx" ON "cita_cambios"("id_cita", "estado");

-- AddForeignKey
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_id_emprendedora_fkey" FOREIGN KEY ("id_emprendedora") REFERENCES "emprendedoras"("id_emprendedora") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_emprendedora_fkey" FOREIGN KEY ("id_emprendedora") REFERENCES "emprendedoras"("id_emprendedora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_mensajes" ADD CONSTRAINT "cita_mensajes_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "citas"("id_cita") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_mensajes" ADD CONSTRAINT "cita_mensajes_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_cambios" ADD CONSTRAINT "cita_cambios_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "citas"("id_cita") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_cambios" ADD CONSTRAINT "cita_cambios_id_proponente_fkey" FOREIGN KEY ("id_proponente") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
