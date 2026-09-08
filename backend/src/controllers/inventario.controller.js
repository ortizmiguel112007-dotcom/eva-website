import prisma from "../conexion.js";
import { crearNotificacion } from "./notificacion.controller.js";
import { registrarMovimiento } from "./movimientoInventario.controller.js";

// GET /api/inventario — inventario de la emprendedora logueada
export const listarInventario = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario },
      include: {
        secciones: {
          include: {
            productos: {
              where: { estado_producto: "activo" },
              include: {
                inventario: true,
                seccion: { select: { id_alianza: true, nombre_seccion: true } },
              },
            },
          },
        },
      },
    });

    if (!emprendedora)
      return res.status(404).json({ error: "Emprendedora no encontrada" });

    // Productos de secciones propias (sin alianza)
    const productosPropios = emprendedora.secciones
      .filter((s) => !s.id_alianza)
      .flatMap((s) => s.productos);

    // Buscar alianzas donde participa (no solo donde es creadora)
    const alianzasParticipante = await prisma.alianza.findMany({
      where: {
        estado: "activa",
        participantes: {
          some: { id_usuario, autorizado: true },
        },
      },
      include: {
        secciones: {
          include: {
            productos: {
              where: { estado_producto: "activo" },
              include: {
                inventario: true,
                seccion: { select: { id_alianza: true, nombre_seccion: true } },
              },
            },
          },
        },
      },
    });

    const productosAlianza = alianzasParticipante
      .flatMap((a) => a.secciones)
      .flatMap((s) => s.productos);

    const mapear = (p, esAlianza = false) => ({
      id_producto: p.id_producto,
      nombre: p.nombre_producto,
      categoria: p.categoria,
      tipo: p.tipo,
      precio: p.precio,
      imagen: p.imagen,
      cantidad: p.inventario?.cantidad ?? 0,
      stock_minimo: p.inventario?.stock_minimo ?? p.stock_minimo,
      stock_maximo: p.inventario?.stock_maximo ?? 100,
      alerta:
        (p.inventario?.cantidad ?? 0) <=
        (p.inventario?.stock_minimo ?? p.stock_minimo),
      es_alianza: esAlianza,
      nombre_seccion: p.seccion?.nombre_seccion || null,
    });

    const inventario = [
      ...productosPropios.map((p) => mapear(p, false)),
      ...productosAlianza.map((p) => mapear(p, true)),
    ];

    // Eliminar duplicados por id_producto
    const seen = new Set();
    const inventarioUnico = inventario.filter((p) => {
      if (seen.has(p.id_producto)) return false;
      seen.add(p.id_producto);
      return true;
    });

    res.json(inventarioUnico);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener inventario" });
  }
};

// PUT /api/inventario/:id — actualizar stock de un producto
export const actualizarStock = async (req, res) => {
  try {
    const id_producto = Number(req.params.id);
    const { cantidad, stock_minimo, stock_maximo } = req.body;

    if (cantidad < 0)
      return res
        .status(400)
        .json({ error: "La cantidad no puede ser negativa" });

    // RN-019: Solo la emprendedora propietaria o el administrador pueden modificar el stock
    const producto = await prisma.producto.findUnique({
      where: { id_producto },
      select: {
        id_creador: true,
        seccion: {
          select: {
            id_alianza: true,
            id_emprendedora: true,
          },
        },
      },
    });

    if (!producto) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    // if (
    //   req.user.rol !== "admin" &&
    //   req.user.rol !== "administrador" &&
    //   producto.id_creador !== req.user.id
    // ) {
    //   return res.status(403).json({
    //     error: "No tienes permiso para modificar el stock de este producto.",
    //   });
    // }
    const esAdmin = req.user.rol === "admin" || req.user.rol === "administrador";
    const esCreadorOriginal = producto.id_creador === req.user.id;

    // Si el producto pertenece a una sección de alianza, permite editar
    // a cualquier participante autorizado de esa alianza, no solo a quien lo creó.
    let esParticipanteAlianza = false;
    if (producto.seccion?.id_alianza) {
      const participante = await prisma.alianzaParticipante.findUnique({
        where: {
          id_alianza_id_usuario: {
            id_alianza: producto.seccion.id_alianza,
            id_usuario: req.user.id,
          },
        },
      });
      esParticipanteAlianza = !!participante?.autorizado;
    }

    if (!esAdmin && !esCreadorOriginal && !esParticipanteAlianza) {
      return res.status(403).json({
        error: "No tienes permiso para modificar el stock de este producto.",
      });
    }

    // Obtener cantidad actual ANTES de actualizar
    const inventarioActual = await prisma.inventario.findUnique({
      where: { id_producto },
    });
    const cantidadAntes = inventarioActual?.cantidad ?? 0;

    const inventario = await prisma.inventario.update({
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

    // Registrar movimiento
    if (cantidad !== undefined) {
      const cantidadNueva = Number(cantidad);
      const tipo =
        cantidadNueva > cantidadAntes
          ? "entrada"
          : cantidadNueva < cantidadAntes
            ? "salida"
            : "ajuste";
      await registrarMovimiento(
        id_producto,
        tipo,
        cantidadAntes,
        cantidadNueva,
        req.user.id,
        "Actualización manual de stock",
      );

      // Notificaciones stock bajo o agotado
      const prod = await prisma.producto.findUnique({
        where: { id_producto },
        include: {
          seccion: {
            include: { emprendedora: { include: { usuario: true } } },
          },
          inventario: true,
        },
      });
      const empUser = prod?.seccion?.emprendedora?.usuario;
      if (empUser) {
        if (cantidadNueva === 0) {
          await crearNotificacion(
            empUser.id,
            "stock",
            "Producto agotado",
            `"${prod.nombre_producto}" se quedó sin stock.`,
            "/inventario",
          );
        } else if (
          cantidadNueva <=
          Number(stock_minimo ?? prod.inventario?.stock_minimo ?? 0)
        ) {
          await crearNotificacion(
            empUser.id,
            "stock",
            "Stock bajo",
            `"${prod.nombre_producto}" tiene stock bajo (${cantidadNueva} unidades).`,
            "/inventario",
          );
        }
      }
    }

    res.json({ message: "Stock actualizado", inventario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar stock" });
  }
};
// GET /api/admin/inventario — auditoría completa (solo admin)
export const auditarInventario = async (req, res) => {
  try {
    // RN-020: Solo el administrador puede auditar el inventario
    if (req.user.rol !== "admin" && req.user.rol !== "administrador") {
      return res.status(403).json({
        error:
          "Acceso denegado. Solo el administrador puede auditar el inventario.",
      });
    }
    const inventario = await prisma.inventario.findMany({
      include: {
        producto: {
          include: {
            seccion: {
              include: {
                emprendedora: {
                  include: { usuario: { select: { nombre: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { id_producto: "asc" },
    });
    res.json(inventario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al auditar inventario" });
  }
};
