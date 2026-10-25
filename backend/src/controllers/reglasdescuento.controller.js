import prisma from "../conexion.js";

// GET /api/reglas-descuento/:id_producto — reglas de un producto
export const listarReglas = async (req, res) => {
  try {
    const id_producto = Number(req.params.id_producto);
    const reglas = await prisma.reglaDescuento.findMany({
      where: { id_producto },
      orderBy: { prioridad: "asc" },
    });
    res.json(reglas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reglas" });
  }
};

// POST /api/reglas-descuento — crear regla
export const crearRegla = async (req, res) => {
  try {
    const {
      id_producto,
      nombre,
      tipo,
      valor,
      condicion,
      stock_limite,
      prioridad,
      fecha_fin,
    } = req.body;

    if (!id_producto || !nombre || !tipo || !valor || !condicion)
      return res.status(400).json({ error: "Faltan campos obligatorios" });

    // RN-018: la oferta solo se puede crear sobre un producto propio, activo y con stock
    const producto = await prisma.producto.findUnique({
      where: { id_producto: Number(id_producto) },
      include: {
        inventario: true,
        seccion: { include: { emprendedora: true } },
      },
    });
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });

    const esDueno =
      producto.id_creador === req.user.id ||
      producto.seccion?.emprendedora?.id_usuario === req.user.id;
    if (!esDueno)
      return res
        .status(403)
        .json({ error: "No tienes permiso para crear ofertas en este producto" });

    if (producto.estado_producto !== "activo")
      return res.status(400).json({
        error: "No se pueden crear ofertas en un producto deshabilitado",
      });

    if ((producto.inventario?.cantidad ?? 0) <= 0)
      return res.status(400).json({
        error: "No se puede crear una oferta en un producto sin stock disponible",
      });

    if (!["porcentaje", "valor_fijo"].includes(tipo))
      return res.status(400).json({ error: "Tipo inválido" });

    if (!["stock_bajo", "stock_menor_a", "siempre"].includes(condicion))
      return res.status(400).json({ error: "Condición inválida" });

    if (tipo === "porcentaje" && (Number(valor) < 1 || Number(valor) > 100))
      return res
        .status(400)
        .json({ error: "El porcentaje debe estar entre 1 y 100" });

    // RI-028: la fecha de vencimiento debe tener formato válido y no ser anterior a hoy
    let fechaFinOferta = null;
    if (fecha_fin) {
      const fechaTxt = String(fecha_fin).slice(0, 10);
      const fechaValida =
        /^\d{4}-\d{2}-\d{2}$/.test(fechaTxt) &&
        !Number.isNaN(new Date(`${fechaTxt}T23:59:59`).getTime());
      if (!fechaValida)
        return res
          .status(400)
          .json({ error: "La fecha de vencimiento no es válida" });

      const ahora = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const hoyTxt = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
      if (fechaTxt < hoyTxt)
        return res.status(400).json({
          error: "La fecha de vencimiento no puede ser anterior a hoy",
        });

      // La oferta vale hasta el final del día elegido
      fechaFinOferta = new Date(`${fechaTxt}T23:59:59`);
    }

    // RN-028.3 — verificar que no haya otra regla activa en el mismo producto
    const reglaActiva = await prisma.reglaDescuento.findFirst({
      where: { id_producto: Number(id_producto), activa: true },
    });
    if (reglaActiva)
      return res
        .status(409)
        .json({
          error:
            "Ya existe una regla activa para este producto. Desactívala primero.",
        });

    const regla = await prisma.reglaDescuento.create({
      data: {
        id_producto: Number(id_producto),
        nombre,
        tipo,
        valor: Number(valor),
        condicion,
        stock_limite: stock_limite ? Number(stock_limite) : null,
        prioridad: prioridad ? Number(prioridad) : 1,
        fecha_fin: fechaFinOferta,
      },
    });

    res.status(201).json({ message: "Regla creada", regla });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear regla" });
  }
};

// PUT /api/reglas-descuento/:id/toggle — activar/desactivar
export const toggleRegla = async (req, res) => {
  try {
    const id_regla = Number(req.params.id);
    const regla = await prisma.reglaDescuento.findUnique({
      where: { id_regla },
    });
    if (!regla) return res.status(404).json({ error: "Regla no encontrada" });

    // RN-028.3 — si se va a activar, verificar que no haya otra activa
    if (!regla.activa) {
      const otraActiva = await prisma.reglaDescuento.findFirst({
        where: {
          id_producto: regla.id_producto,
          activa: true,
          id_regla: { not: id_regla },
        },
      });
      if (otraActiva)
        return res
          .status(409)
          .json({ error: "Ya hay una regla activa para este producto" });
    }

    const actualizada = await prisma.reglaDescuento.update({
      where: { id_regla },
      data: { activa: !regla.activa },
    });

    res.json({
      message: `Regla ${actualizada.activa ? "activada" : "desactivada"}`,
      regla: actualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
};

// DELETE /api/reglas-descuento/:id — eliminar regla
export const eliminarRegla = async (req, res) => {
  try {
    const id_regla = Number(req.params.id);
    await prisma.reglaDescuento.delete({ where: { id_regla } });
    res.json({ message: "Regla eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar regla" });
  }
};

// Función helper — aplica descuento según reglas activas (RN-028.1 y RN-028.2)
export const aplicarDescuento = async (id_producto, precio, stock_actual) => {
  try {
    // RN-018: sin stock disponible no se aplica ningún descuento
    if (!(Number(stock_actual) > 0)) return null;

    const ahora = new Date();

    // Obtener reglas activas ordenadas por prioridad
    const reglas = await prisma.reglaDescuento.findMany({
      where: {
        id_producto,
        activa: true,
        OR: [{ fecha_fin: null }, { fecha_fin: { gt: ahora } }],
      },
      orderBy: { prioridad: "asc" },
    });

    // RN-028.1 — aplicar primera regla que cumpla la condición de inventario
    for (const regla of reglas) {
      let aplica = false;

      if (regla.condicion === "siempre") {
        aplica = true;
      } else if (regla.condicion === "stock_bajo") {
        // Verificar stock mínimo del producto
        const inventario = await prisma.inventario.findUnique({
          where: { id_producto },
        });
        aplica = stock_actual <= (inventario?.stock_minimo || 0);
      } else if (regla.condicion === "stock_menor_a") {
        aplica = stock_actual < (regla.stock_limite || 0);
      }

      if (aplica) {
        const descuento =
          regla.tipo === "porcentaje"
            ? Number(precio) * (Number(regla.valor) / 100)
            : Number(regla.valor);

        return {
          precio_original: parseFloat(Number(precio).toFixed(2)),
          precio_con_descuento: parseFloat(
            Math.max(0, Number(precio) - descuento).toFixed(2),
          ),
          descuento: parseFloat(descuento.toFixed(2)),
          tipo: regla.tipo,
          valor: parseFloat(Number(regla.valor).toFixed(2)),
          nombre_regla: regla.nombre,
        };
      }
    }

    return null; // sin descuento
  } catch (error) {
    console.error("Error aplicando descuento:", error);
    return null;
  }
};