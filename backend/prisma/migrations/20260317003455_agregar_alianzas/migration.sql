-- CreateTable
CREATE TABLE "alianzas" (
    "id_alianza" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "creada_por" INTEGER NOT NULL,

    CONSTRAINT "alianzas_pkey" PRIMARY KEY ("id_alianza")
);

-- CreateTable
CREATE TABLE "alianza_participantes" (
    "id" SERIAL NOT NULL,
    "id_alianza" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "autorizado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_union" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alianza_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alianza_participantes_id_alianza_id_usuario_key" ON "alianza_participantes"("id_alianza", "id_usuario");

-- AddForeignKey
ALTER TABLE "alianzas" ADD CONSTRAINT "alianzas_creada_por_fkey" FOREIGN KEY ("creada_por") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alianza_participantes" ADD CONSTRAINT "alianza_participantes_id_alianza_fkey" FOREIGN KEY ("id_alianza") REFERENCES "alianzas"("id_alianza") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alianza_participantes" ADD CONSTRAINT "alianza_participantes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
