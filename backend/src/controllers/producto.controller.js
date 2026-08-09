import prisma from "../conexion.js";
import { aplicarDescuento } from "./reglasdescuento.controller.js";
import { crearNotificacion } from "./notificacion.controller.js";

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
        secciones: { orderBy: { fecha_creacion: "asc" } },
      },
    });

    if (!emprendedora)
      return res.status(404).json({ error: "Emprendedora no encontrada" });
    if (!emprendedora.secciones.length)
      return res.status(404).json({ error: "No tienes sección creada" });

    let id_seccion =
      emprendedora.secciones.find((s) => !s.id_alianza)?.id_seccion ||
      emprendedora.secciones[0].id_seccion;

    if (req.body.id_seccion_alianza) {
      const seccionAlianza = await prisma.seccion.findFirst({
        where: { id_seccion: Number(req.body.id_seccion_alianza) },
        include: { alianza: { include: { participantes: true } } },
      });
      const participa = seccionAlianza?.alianza?.participantes?.some(
        (p) => p.id_usuario === id_usuario && p.autorizado,
      );
      if (seccionAlianza && participa) {
        id_seccion = seccionAlianza.id_seccion;
      }
    }

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

    // RN-014: La cantidad inicial no puede ser negativa
    if ((tipo || "producto") !== "servicio" && Number(cantidad) < 0) {
      return res.status(400).json({
        error: "La cantidad inicial no puede ser negativa.",
      });
    }

    const productoExistente = await prisma.producto.findFirst({
      where: {
        id_creador: id_usuario,
        nombre_producto,
        categoria,
        estado_producto: {
          not: "inactivo",
        },
      },
    });

    if (productoExistente) {
      return res.status(409).json({
        error: "Ya existe un producto con ese nombre en esa categoría.",
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: {
          id_seccion,
          id_creador: id_usuario,
          nombre_producto,
          descripcion,
          precio: Number(precio),
          categoria,
          imagen,
          stock_minimo: Number(stock_minimo) || 0,
          duracion: duracion || null,
          tipo: tipo || "producto",
          estado_producto: "pendiente",
          visible: false,
        },
      });

      const esServicio = (tipo || "producto") === "servicio";

      const inventario = await tx.inventario.create({
        data: {
          id_producto: producto.id_producto,
          cantidad: esServicio ? 9999 : Number(cantidad) || 0,
          stock_minimo: esServicio ? 0 : Number(stock_minimo) || 0,
          stock_maximo: esServicio ? 9999 : 100,
        },
      });

      return { ...producto, inventario };
    });

    const admins = await prisma.user.findMany({
      where: { rol: { in: ["admin", "administrador"] } },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) =>
        crearNotificacion(
          a.id,
          "solicitud",
          "Nuevo producto pendiente",
          `La emprendedora ${req.user.nombre} ha publicado "${nombre_producto}" y está esperando aprobación.`,
          "/admin/productos",
        ),
      ),
    );

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
            alianza: {
              include: {
                participantes: {
                  include: {
                    usuario: { select: { nombre: true } },
                  },
                },
              },
            },
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
    const stock = item.inventario?.cantidad ?? 0;
    const descuento = await aplicarDescuento(
      item.id_producto,
      item.precio,
      stock,
    );
    res.json({ ...item, descuento });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener item" });
  }
};

export const obtenerProductosPublicos = async (req, res) => {
  try {
    const id_emprendedora = Number(req.params.id_emprendedora);
    const productos = await prisma.producto.findMany({
      where: {
        seccion: { id_emprendedora, id_alianza: null },
        estado_producto: "activo",
        visible: true,
      },
      orderBy: { nombre_producto: "asc" },
    });
    const conDescuento = await Promise.all(
      productos.map(async (p) => {
        try {
          const stock = p.inventario?.cantidad ?? 0;
          const descuento = await aplicarDescuento(
            p.id_producto,
            p.precio,
            stock,
          );
          return { ...p, descuento };
        } catch {
          return { ...p, descuento: null };
        }
      }),
    );
    res.json(conDescuento);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

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

    const producto = await prisma.producto.findUnique({
      where: { id_producto },
      select: {
        id_creador: true,
      },
    });

    if (!producto) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    if (
      req.user.rol !== "admin" &&
      req.user.rol !== "administrador" &&
      producto.id_creador !== req.user.id
    ) {
      return res.status(403).json({
        error: "No tienes permiso para modificar este producto.",
      });
    }

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

      const productoActual = await tx.producto.findUnique({
        where: { id_producto },
        select: { tipo: true },
      });

      if (productoActual?.tipo !== "servicio") {
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
      }

      return producto;
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error al actualizar item:", error.message);
    res.status(500).json({ error: "Error al actualizar item" });
  }
};

// ── Deshabilitar (soft delete) ─────────────────────────────────────────────
// No borra el registro — pone estado_producto = "inactivo" y visible = false
// Así no hay conflictos de FK en la base de datos.
export const eliminarItem = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const motivo = req.body?.motivo?.trim() || null;

    const producto = await prisma.producto.findUnique({
      where: { id_producto: id },
      include: {
        seccion: {
          include: { emprendedora: { include: { usuario: true } } },
        },
      },
    });

    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });

    if (
      req.user.rol !== "admin" &&
      req.user.rol !== "administrador" &&
      producto.id_creador !== req.user.id
    ) {
      return res.status(403).json({
        error: "No tienes permiso para deshabilitar este producto.",
      });
    }

    const eraPendiente = producto.estado_producto === "pendiente";
    const idUsuario = producto.seccion?.emprendedora?.usuario?.id;

    // Soft delete — solo deshabilita, no elimina el registro
    await prisma.producto.update({
      where: { id_producto: id },
      data: { estado_producto: "inactivo", visible: false },
    });

    // Notificar a la emprendedora con el motivo si se proporcionó
    if (idUsuario) {
      const titulo = eraPendiente
        ? "Producto rechazado"
        : "Producto deshabilitado";
      const base = eraPendiente
        ? `Tu producto "${producto.nombre_producto}" fue rechazado por el administrador.`
        : `Tu producto "${producto.nombre_producto}" fue deshabilitado por el administrador.`;
      const mensaje = motivo ? `${base} Motivo: ${motivo}` : base;

      await crearNotificacion(
        idUsuario,
        "solicitud",
        titulo,
        mensaje,
        "/dashboard",
      );
    }

    res.json({ message: "Producto deshabilitado correctamente" });
  } catch (error) {
    console.error("ERROR DESHABILITANDO:", error);
    res.status(500).json({ error: error.message });
  }
};

export const listarTodosAdmin = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        estado_producto: { not: "inactivo" },
      },
      include: {
        inventario: true,
        seccion: {
          include: {
            emprendedora: {
              include: { usuario: { select: { nombre: true } } },
            },
          },
        },
      },
      orderBy: { id_producto: "desc" },
    });
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

export const listarMisItems = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario },
      include: { secciones: true },
    });
    if (!emprendedora) return res.status(404).json({ error: "No encontrada" });

    const idSecciones = emprendedora.secciones.map((s) => s.id_seccion);

    const items = await prisma.producto.findMany({
      where: {
        estado_producto: "activo",
        OR: [{ id_seccion: { in: idSecciones } }, { id_creador: id_usuario }],
      },
      include: {
        inventario: true,
        seccion: {
          include: {
            alianza: { select: { nombre: true, id_alianza: true } },
          },
        },
      },
      orderBy: { nombre_producto: "asc" },
    });

    const itemsConDescuento = await Promise.all(
      items.map(async (p) => {
        const stock = p.inventario?.cantidad ?? 0;
        const descuento = await aplicarDescuento(
          p.id_producto,
          p.precio,
          stock,
        );
        return { ...p, descuento };
      }),
    );
    res.json(itemsConDescuento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener items" });
  }
};

export const aprobarProducto = async (req, res) => {
  try {
    const id_producto = Number(req.params.id);

    const producto = await prisma.producto.findUnique({
      where: { id_producto },
      include: {
        seccion: {
          include: { emprendedora: { include: { usuario: true } } },
        },
      },
    });

    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });

    await prisma.producto.update({
      where: { id_producto },
      data: { estado_producto: "activo", visible: true },
    });

    const idUsuario = producto.seccion?.emprendedora?.usuario?.id;
    if (idUsuario) {
      await crearNotificacion(
        idUsuario,
        "solicitud",
        "Producto aprobado",
        `Tu producto "${producto.nombre_producto}" fue aprobado y ya está visible en el catálogo.`,
        "/dashboard",
      );
    }

    res.json({ message: "Producto aprobado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al aprobar producto" });
  }
};
