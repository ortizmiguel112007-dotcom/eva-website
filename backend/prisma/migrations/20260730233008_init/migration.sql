-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "token" TEXT,
    "codigoExpira" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "foto_documento" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificacionPendiente" (
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "expiracion" TIMESTAMP(3) NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "foto_documento" TEXT,

    CONSTRAINT "VerificacionPendiente_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "emprendedoras" (
    "id_emprendedora" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "datos_bancarios" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "nequi_numero" TEXT,
    "bancolombia_numero" TEXT,
    "bancolombia_tipo" TEXT,
    "titular_cuenta" TEXT,
    "acepta_contraentrega" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "emprendedoras_pkey" PRIMARY KEY ("id_emprendedora")
);

-- CreateTable
CREATE TABLE "secciones" (
    "id_seccion" SERIAL NOT NULL,
    "id_emprendedora" INTEGER NOT NULL,
    "nombre_seccion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_alianza" INTEGER,

    CONSTRAINT "secciones_pkey" PRIMARY KEY ("id_seccion")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" SERIAL NOT NULL,
    "id_seccion" INTEGER NOT NULL,
    "id_creador" INTEGER,
    "nombre_producto" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(15,2) NOT NULL,
    "categoria" TEXT,
    "estado_producto" TEXT NOT NULL DEFAULT 'activo',
    "duracion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'producto',
    "imagen" TEXT,
    "tamano_imagen" INTEGER,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "ultima_modificacion_stock" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,

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

-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" SERIAL NOT NULL,
    "id_usuario_accion" INTEGER NOT NULL,
    "id_registro" INTEGER NOT NULL,
    "tabla_afectada" VARCHAR(50) NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "detalles" VARCHAR(500),

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_seccion" INTEGER NOT NULL,
    "id_pago" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'pendiente_pago',
    "total" DECIMAL(10,3) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" TEXT,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "detalle_pedidos" (
    "id_detalle" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unit" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "detalle_pedidos_pkey" PRIMARY KEY ("id_detalle")
);

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

-- CreateTable
CREATE TABLE "comentarios" (
    "id_comentario" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id_comentario")
);

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

-- CreateTable
CREATE TABLE "pagos" (
    "id_pago" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "monto_total" DECIMAL(10,3) NOT NULL,
    "metodo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "comprobante" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_verif" TIMESTAMP(3),
    "nota_rechazo" TEXT,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id_notificacion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id_favorito" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id_favorito")
);

-- CreateTable
CREATE TABLE "reglas_descuento" (
    "id_regla" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "condicion" TEXT NOT NULL,
    "stock_limite" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "prioridad" INTEGER NOT NULL DEFAULT 1,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),

    CONSTRAINT "reglas_descuento_pkey" PRIMARY KEY ("id_regla")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id_movimiento" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad_antes" INTEGER NOT NULL,
    "cantidad_nueva" INTEGER NOT NULL,
    "motivo" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "emprendedoras_id_usuario_key" ON "emprendedoras"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_id_producto_key" ON "inventario"("id_producto");

-- CreateIndex
CREATE UNIQUE INDEX "alianza_participantes_id_alianza_id_usuario_key" ON "alianza_participantes"("id_alianza", "id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "cupones_codigo_key" ON "cupones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "carritos_id_usuario_key" ON "carritos"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "carrito_items_id_carrito_id_producto_key" ON "carrito_items"("id_carrito", "id_producto");

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_id_usuario_id_producto_key" ON "favoritos"("id_usuario", "id_producto");

-- AddForeignKey
ALTER TABLE "emprendedoras" ADD CONSTRAINT "emprendedoras_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_id_emprendedora_fkey" FOREIGN KEY ("id_emprendedora") REFERENCES "emprendedoras"("id_emprendedora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_id_alianza_fkey" FOREIGN KEY ("id_alianza") REFERENCES "alianzas"("id_alianza") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_seccion_fkey" FOREIGN KEY ("id_seccion") REFERENCES "secciones"("id_seccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_creador_fkey" FOREIGN KEY ("id_creador") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_accion_fkey" FOREIGN KEY ("id_usuario_accion") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_seccion_fkey" FOREIGN KEY ("id_seccion") REFERENCES "secciones"("id_seccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pagos"("id_pago") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedidos" ADD CONSTRAINT "detalle_pedidos_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedidos" ADD CONSTRAINT "detalle_pedidos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alianzas" ADD CONSTRAINT "alianzas_creada_por_fkey" FOREIGN KEY ("creada_por") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alianza_participantes" ADD CONSTRAINT "alianza_participantes_id_alianza_fkey" FOREIGN KEY ("id_alianza") REFERENCES "alianzas"("id_alianza") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alianza_participantes" ADD CONSTRAINT "alianza_participantes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupones" ADD CONSTRAINT "cupones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carritos" ADD CONSTRAINT "carritos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_id_carrito_fkey" FOREIGN KEY ("id_carrito") REFERENCES "carritos"("id_carrito") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reglas_descuento" ADD CONSTRAINT "reglas_descuento_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
