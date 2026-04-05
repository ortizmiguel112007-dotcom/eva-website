-- CreateTable
CREATE TABLE "carritos" (
    "id_carrito" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_act" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carritos_pkey" PRIMARY KEY ("id_carrito")
);

-- CreateTable
CREATE TABLE "carrito_items" (
    "id_item" SERIAL NOT NULL,
    "id_carrito" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "carrito_items_pkey" PRIMARY KEY ("id_item")
);

-- CreateIndex
CREATE UNIQUE INDEX "carritos_id_usuario_key" ON "carritos"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "carrito_items_id_carrito_id_producto_key" ON "carrito_items"("id_carrito", "id_producto");

-- AddForeignKey
ALTER TABLE "carritos" ADD CONSTRAINT "carritos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_id_carrito_fkey" FOREIGN KEY ("id_carrito") REFERENCES "carritos"("id_carrito") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;
