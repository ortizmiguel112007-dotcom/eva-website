import prisma from "../conexion.js";
import { crearNotificacion } from "./notificacion.controller.js";

// GET /api/cupones — cupones de la emprendedora
export const listarCupones = async (req, res) => {
  try {
    const cupones = await prisma.cupon.findMany({
      where: { id_usuario: req.user.id },
      orderBy: { fecha_inicio: "desc" },
    });
    res.json(cupones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener cupones" });
  }
};

// POST /api/cupones — crear cupón (RN-083: solo emprendedora, validado por rol en la ruta)
export const crearCupon = async (req, res) => {
  try {
    const { codigo, tipo, valor, descripcion, fecha_inicio, fecha_fin, limite_usos } = req.body;

    if (!codigo || !tipo || !valor)
      return res.status(400).json({ error: "Código, tipo y valor son obligatorios" });
    if (!["porcentaje", "valor_fijo"].includes(tipo))
      return res.status(400).json({ error: "Tipo inválido" });
    if (tipo === "porcentaje" && (Number(valor) < 1 || Number(valor) > 100))
      return res.status(400).json({ error: "El porcentaje debe estar entre 1 y 100" });

    const existe = await prisma.cupon.findUnique({ where: { codigo: codigo.toUpperCase() } });
    if (existe) return res.status(409).json({ error: "El código ya existe" });

    const inicio = fecha_inicio ? new Date(fecha_inicio) : new Date();
    // RN-084: si el cupón empieza en el futuro, nace inactivo hasta que el job automático lo active
    const activoInicial = inicio <= new Date();

    const cupon = await prisma.cupon.create({
      data: {
        id_usuario: req.user.id,
        codigo: codigo.toUpperCase(),
        tipo,
        valor: Number(valor),
        descripcion: descripcion || null,
        fecha_inicio: inicio,
        fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
        limite_usos: limite_usos ? Number(limite_usos) : null,
        activo: activoInicial,
      },
    });

    if (activoInicial) {
      const usuarios = await prisma.user.findMany({ where: { rol: "usuario", activo: true }, select: { id: true } });
      await Promise.all(
        usuarios.map((u) =>
          crearNotificacion(u.id, "cupon", "Nuevo cupón disponible", `Usa el código ${cupon.codigo} para obtener descuento.`, "/mis-cupones"),
        ),
      );
    }

    res.status(201).json({ message: "Cupón creado", cupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear cupón" });
  }
};

// PUT /api/cupones/:id/toggle — activar/desactivar (dueño)
export const toggleCupon = async (req, res) => {
  try {
    const id_cupon = Number(req.params.id);
    const cupon = await prisma.cupon.findUnique({ where: { id_cupon } });
    if (!cupon) return res.status(404).json({ error: "Cupón no encontrado" });
    if (cupon.id_usuario !== req.user.id) return res.status(403).json({ error: "No autorizado" });

    const actualizado = await prisma.cupon.update({
      where: { id_cupon },
      data: { activo: !cupon.activo },
    });
    res.json({ message: `Cupón ${actualizado.activo ? "activado" : "desactivado"}`, cupon: actualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
};

// PUT /api/admin/cupones/:id/desactivar — RN-089: admin puede desactivar cualquiera
export const desactivarCuponAdmin = async (req, res) => {
  try {
    const id_cupon = Number(req.params.id);
    const { motivo } = req.body;

    const cupon = await prisma.cupon.findUnique({ where: { id_cupon }, include: { usuario: true } });
    if (!cupon) return res.status(404).json({ error: "Cupón no encontrado" });

    const actualizado = await prisma.cupon.update({ where: { id_cupon }, data: { activo: false } });

    await crearNotificacion(
      cupon.id_usuario, "cupon", "Cupón desactivado por el administrador",
      `Tu cupón "${cupon.codigo}" fue desactivado.${motivo ? " Motivo: " + motivo : ""}`, "/cupones",
    );

    res.json({ message: "Cupón desactivado", cupon: actualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar cupón" });
  }
};

// DELETE /api/cupones/:id — eliminar cupón (dueño)
export const eliminarCupon = async (req, res) => {
  try {
    const id_cupon = Number(req.params.id);
    const cupon = await prisma.cupon.findUnique({ where: { id_cupon } });
    if (!cupon) return res.status(404).json({ error: "Cupón no encontrado" });
    if (cupon.id_usuario !== req.user.id) return res.status(403).json({ error: "No autorizado" });

    await prisma.cupon.delete({ where: { id_cupon } });
    res.json({ message: "Cupón eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar cupón" });
  }
};

// POST /api/cupones/validar — validación previa (preview en el carrito, RF-097)
export const validarCupon = async (req, res) => {
  try {
    const { codigo } = req.body;
    const cupon = await prisma.cupon.findUnique({ where: { codigo: codigo.toUpperCase() } });

    if (!cupon) return res.status(404).json({ error: "Cupón no encontrado" });
    if (!cupon.activo) return res.status(400).json({ error: "Cupón inactivo" });
    if (cupon.fecha_inicio && new Date() < cupon.fecha_inicio)
      return res.status(400).json({ error: "Este cupón aún no está vigente" });
    if (cupon.fecha_fin && new Date() > cupon.fecha_fin)
      return res.status(400).json({ error: "Cupón expirado" });
    if (cupon.limite_usos && cupon.usos >= cupon.limite_usos)
      return res.status(400).json({ error: "Cupón agotado" });



    // Devuelve también las secciones donde aplica, para que el frontend
    // pueda mostrar un preview de descuento correcto por tienda
     const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: cupon.id_usuario },
      include: {
        secciones: { select: { id_seccion: true } },
        usuario: { select: { nombre: true } },
      },
    });

    res.json({
      valido: true,
      id_cupon: cupon.id_cupon,
      tipo: cupon.tipo,
      valor: cupon.valor,
      codigo: cupon.codigo,
      descripcion: cupon.descripcion,
      tienda: emprendedora?.usuario?.nombre || null,
      secciones_aplicables: emprendedora?.secciones.map((s) => s.id_seccion) || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al validar cupón" });
  }
};

// GET /api/admin/cupones — todos (admin)
export const listarTodosCuponesAdmin = async (req, res) => {
  try {
    const cupones = await prisma.cupon.findMany({
      include: { usuario: { select: { nombre: true, email: true } } },
      orderBy: { fecha_inicio: "desc" },
    });
    res.json(cupones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener cupones" });
  }
};

// GET /api/cupones/publicos — activos y vigentes para clientes
export const listarCuponesPublicos = async (req, res) => {
  try {
    const ahora = new Date();
    const cupones = await prisma.cupon.findMany({
      where: {
        activo: true,
        fecha_inicio: { lte: ahora },
        OR: [{ fecha_fin: null }, { fecha_fin: { gt: ahora } }],
      },
      include: { usuario: { select: { nombre: true } } },
      orderBy: { fecha_inicio: "desc" },
    });
    res.json(cupones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener cupones" });
  }
};

// GET /api/cupones/:id/metricas — RF-098, uso propio (dueño)
export const metricasCupon = async (req, res) => {
  try {
    const id_cupon = Number(req.params.id);
    const cupon = await prisma.cupon.findUnique({ where: { id_cupon } });
    if (!cupon) return res.status(404).json({ error: "Cupón no encontrado" });
    if (cupon.id_usuario !== req.user.id) return res.status(403).json({ error: "No autorizado" });

    const usosLog = await prisma.cuponUso.findMany({
      where: { id_cupon },
      include: { cliente: { select: { nombre: true } }, pedido: { select: { id_pedido: true, total: true } } },
      orderBy: { fecha: "desc" },
    });

    const totalDescontado = usosLog.reduce((acc, u) => acc + Number(u.monto_descuento), 0);

    res.json({
      codigo: cupon.codigo,
      usos_totales: cupon.usos,
      limite_usos: cupon.limite_usos,
      total_descontado: totalDescontado,
      historial: usosLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener métricas" });
  }
};

// GET /api/admin/cupones/metricas/export?formato=pdf|excel — RN-086
export const exportarMetricasCupones = async (req, res) => {
  try {
    const formato = req.query.formato === "excel" ? "excel" : "pdf";
    const cupones = await prisma.cupon.findMany({ include: { usuario: { select: { nombre: true } } } });

    const filas = await Promise.all(
      cupones.map(async (c) => {
        const usos = await prisma.cuponUso.findMany({ where: { id_cupon: c.id_cupon } });
        const totalDescontado = usos.reduce((acc, u) => acc + Number(u.monto_descuento), 0);
        return { codigo: c.codigo, emprendedora: c.usuario?.nombre, usos: c.usos, total_descontado: totalDescontado };
      }),
    );

    if (formato === "excel") {
      const { default: XLSX } = await import("xlsx");
      const hoja = XLSX.utils.json_to_sheet(filas.map((f) => ({
        Código: f.codigo, Emprendedora: f.emprendedora, Usos: f.usos, "Total descontado": f.total_descontado,
      })));
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, "Cupones");
      const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Disposition", "attachment; filename=metricas_cupones.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);
    }

    const { default: PDFDocument } = await import("pdfkit");
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Disposition", "attachment; filename=metricas_cupones.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.fontSize(16).text("Métricas de Cupones", { align: "center" });
    doc.moveDown(1);
    filas.forEach((f) => {
      doc.fontSize(11).text(`${f.codigo} — ${f.emprendedora}`);
      doc.fontSize(9).fillColor("#64748b").text(`Usos: ${f.usos}   Total descontado: $${f.total_descontado.toLocaleString("es-CO")}`);
      doc.fillColor("#000").moveDown(0.7);
    });
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al exportar métricas" });
  }
};

// Job automático — RN-084: activa/desactiva cupones según fechas
export const actualizarEstadoCupones = async () => {
  try {
    const ahora = new Date();

    const vencidos = await prisma.cupon.updateMany({
      where: { activo: true, fecha_fin: { lt: ahora } },
      data: { activo: false },
    });

    const porIniciar = await prisma.cupon.updateMany({
      where: { activo: false, fecha_inicio: { lte: ahora }, OR: [{ fecha_fin: null }, { fecha_fin: { gt: ahora } }] },
      data: { activo: true },
    });
     // RN-084: desactiva cupones que ya alcanzaron su límite de usos
    const candidatos = await prisma.cupon.findMany({
      where: { activo: true, limite_usos: { not: null } },
      select: { id_cupon: true, usos: true, limite_usos: true },
    });

    const idsAgotados = candidatos.filter(c => c.usos >= c.limite_usos).map(c => c.id_cupon);
    let agotadosCount = 0;
    if (idsAgotados.length) {
      const resultado = await prisma.cupon.updateMany({
        where: { id_cupon: { in: idsAgotados } },
        data: { activo: false },
      });
      agotadosCount = resultado.count;
    }

    if (vencidos.count || porIniciar.count || agotadosCount) {
      console.log(`[cupones] ${vencidos.count} desactivados por vencimiento, ${porIniciar.count} activados por fecha de inicio, ${agotadosCount} desactivados por límite de usos`);
    }
  } catch (err) {
    console.error("Error en actualización automática de cupones:", err);
  }
};
