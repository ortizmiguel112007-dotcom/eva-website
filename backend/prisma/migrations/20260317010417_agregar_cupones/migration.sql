-- CreateTable
CREATE TABLE "cupones" (
    "id_cupon" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(10,3) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "limite_usos" INTEGER,
    "usos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cupones_pkey" PRIMARY KEY ("id_cupon")
);

-- CreateIndex
CREATE UNIQUE INDEX "cupones_codigo_key" ON "cupones"("codigo");

-- AddForeignKey
ALTER TABLE "cupones" ADD CONSTRAINT "cupones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
