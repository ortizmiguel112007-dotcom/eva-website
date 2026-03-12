-- CreateTable
CREATE TABLE "emprendedoras" (
    "id_emprendedora" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "datos_bancarios" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "emprendedoras_pkey" PRIMARY KEY ("id_emprendedora")
);

-- CreateTable
CREATE TABLE "secciones" (
    "id_seccion" SERIAL NOT NULL,
    "id_emprendedora" INTEGER NOT NULL,
    "nombre_seccion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secciones_pkey" PRIMARY KEY ("id_seccion")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" SERIAL NOT NULL,
    "id_seccion" INTEGER NOT NULL,
    "nombre_producto" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,3) NOT NULL,
    "categoria" TEXT,
    "estado_producto" TEXT NOT NULL DEFAULT 'activo',
    "imagen" TEXT,
    "tamano_imagen" INTEGER,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "ultima_modificacion_stock" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id_inventario" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stock_minimo" INTEGER NOT NULL,
    "stock_maximo" INTEGER NOT NULL,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id_inventario")
);

-- CreateIndex
CREATE UNIQUE INDEX "emprendedoras_id_usuario_key" ON "emprendedoras"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_id_producto_key" ON "inventario"("id_producto");

-- AddForeignKey
ALTER TABLE "emprendedoras" ADD CONSTRAINT "emprendedoras_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_id_emprendedora_fkey" FOREIGN KEY ("id_emprendedora") REFERENCES "emprendedoras"("id_emprendedora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_seccion_fkey" FOREIGN KEY ("id_seccion") REFERENCES "secciones"("id_seccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;
