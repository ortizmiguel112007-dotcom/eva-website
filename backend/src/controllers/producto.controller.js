import prisma from "../conexion.js";

export const crearItem = async (req, res) => {
  console.log("=== CREAR ITEM ===");
  console.log("USER:", req.user);
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  try {
    const id_usuario = req.user.id;

    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario },
      include: {
        secciones: { orderBy: { fecha_creacion: "asc" }, take: 1 },
      },
    });

    console.log("EMPRENDEDORA:", emprendedora);

    if (!emprendedora)
      return res.status(404).json({ error: "Emprendedora no encontrada" });
    if (!emprendedora.secciones.length)
      return res.status(404).json({ error: "No tienes sección creada" });

    const id_seccion = emprendedora.secciones[0].id_seccion;
    const {
      nombre_producto,
      descripcion,
      precio,
      categoria,
      stock_minimo,
      cantidad,
      duracion,
      tipo,
    } = req.body;
    const imagen = req.file ? req.file.path : null;

    console.log("INTENTANDO CREAR PRODUCTO...");

    const resultado = await prisma.$transaction(async (tx) => {
      console.log("DENTRO DE TRANSACCIÓN");

      const producto = await tx.producto.create({
        data: {
          id_seccion,
          nombre_producto,
          descripcion,
          precio: Number(precio),
          categoria,
          imagen,
          stock_minimo: Number(stock_minimo) || 0,
          duracion: duracion || null,
          tipo: tipo || "producto",
        },
      });

      const inventario = await tx.inventario.create({
        data: {
          id_producto: producto.id_producto,
          cantidad: Number(cantidad) || 0,
          stock_minimo: Number(stock_minimo) || 0,
          stock_maximo: 100,
        },
      });

      return { ...producto, inventario };
    });

    console.log("PRODUCTO CREADO:", resultado);
    return res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al crear item:", error);
    return res.status(500).json({ error: "Error al crear el producto" });
  }
};

export const obtenerItems = async (req, res) => {
  try {
    const id_seccion = Number(req.params.id_seccion);
    const categoria = req.query.categoria;
    const items = await prisma.producto.findMany({
      where: {
        id_seccion,
        estado_producto: "activo",
        ...(categoria && { categoria }),
      },
      include: { inventario: true },
      orderBy: { nombre_producto: "asc" },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener items" });
  }
};

export const obtenerItemPorId = async (req, res) => {
  try {
    const item = await prisma.producto.findUnique({
      where: { id_producto: Number(req.params.id) },
      include: {
        inventario: true,
        seccion: {
          include: {
            emprendedora: {
              include: {
                usuario: { select: { nombre: true, email: true } },
              },
            },
          },
        },
      },
    });
    if (!item) return res.status(404).json({ error: "Item no encontrado" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener item" });
  }
};

// GET público — productos visibles de una emprendedora
export const obtenerProductosPublicos = async (req, res) => {
  try {
    const id_emprendedora = Number(req.params.id_emprendedora);
    const productos = await prisma.producto.findMany({
      where: {
        seccion: { id_emprendedora },
        estado_producto: "activo",
        visible: true,
      },
      orderBy: { nombre_producto: "asc" },
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// PATCH — toggle visible
export const toggleVisible = async (req, res) => {
  try {
    const id_producto = Number(req.params.id);
    const producto = await prisma.producto.findUnique({
      where: { id_producto },
    });
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });

    const actualizado = await prisma.producto.update({
      where: { id_producto },
      data: { visible: !producto.visible },
    });
    res.json({ visible: actualizado.visible });
  } catch (error) {
    res.status(500).json({ error: "Error al cambiar visibilidad" });
  }
};

export const actualizarItem = async (req, res) => {
  console.log("=== ACTUALIZAR ITEM ===");
  console.log("FILE:", req.file);
  console.log("BODY:", req.body);

  try {
    const id_producto = Number(req.params.id);
    const {
      cantidad,
      stock_minimo,
      stock_maximo,
      duracion,
      precio,
      nombre_producto,
      descripcion,
      categoria,
    } = req.body;
    const imagen = req.file ? req.file.path : undefined;

    console.log("ID:", id_producto, "IMAGEN:", imagen);

    const resultado = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.update({
        where: { id_producto },
        data: {
          ...(nombre_producto && { nombre_producto }),
          ...(descripcion && { descripcion }),
          ...(precio && { precio: Number(precio) }),
          ...(categoria && { categoria }),
          ...(duracion !== undefined && { duracion: duracion || null }),
          ...(imagen && { imagen }),
          ...(stock_minimo !== undefined && {
            stock_minimo: Number(stock_minimo),
          }),
        },
      });

      await tx.inventario.update({
        where: { id_producto },
        data: {
          ...(cantidad !== undefined && { cantidad: Number(cantidad) }),
          ...(stock_minimo !== undefined && {
            stock_minimo: Number(stock_minimo),
          }),
          ...(stock_maximo !== undefined && {
            stock_maximo: Number(stock_maximo),
          }),
        },
      });

      return producto;
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error al actualizar item:", error.message);
    console.error("DETALLE:", error);
    res.status(500).json({ error: "Error al actualizar item" });
  }
};
export const eliminarItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.$transaction(async (tx) => {
      // Eliminar relaciones primero
      await tx.inventario.deleteMany({ where: { id_producto: id } });
      await tx.comentario.deleteMany({ where: { id_producto: id } });
      await tx.detallePedido.deleteMany({ where: { id_producto: id } });

      // Luego eliminar el producto
      await tx.producto.delete({ where: { id_producto: id } });
    });

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("ERROR ELIMINANDO:", error);
    res.status(500).json({ error: error.message });
  }
};
