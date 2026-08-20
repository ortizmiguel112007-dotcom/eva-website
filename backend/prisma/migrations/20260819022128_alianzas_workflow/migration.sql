-- CreateTable
CREATE TABLE "alianza_logs" (
    "id_log" SERIAL NOT NULL,
    "id_alianza" INTEGER NOT NULL,
    "id_usuario" INTEGER,
    "evento" TEXT NOT NULL,
    "detalle" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alianza_logs_pkey" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "alianza_eventos" (
    "id_evento" SERIAL NOT NULL,
    "id_alianza" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alianza_eventos_pkey" PRIMARY KEY ("id_evento")
);

-- AddForeignKey
ALTER TABLE "alianza_logs" ADD CONSTRAINT "alianza_logs_id_alianza_fkey" FOREIGN KEY ("id_alianza") REFERENCES "alianzas"("id_alianza") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alianza_logs" ADD CONSTRAINT "alianza_logs_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alianza_eventos" ADD CONSTRAINT "alianza_eventos_id_alianza_fkey" FOREIGN KEY ("id_alianza") REFERENCES "alianzas"("id_alianza") ON DELETE RESTRICT ON UPDATE CASCADE;
