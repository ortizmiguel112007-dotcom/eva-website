-- CreateTable
CREATE TABLE "favoritos" (
    "id_favorito" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id_favorito")
);

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_id_usuario_id_producto_key" ON "favoritos"("id_usuario", "id_producto");

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;
