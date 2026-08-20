import prisma from "../conexion.js";
import { crearNotificacion } from './notificacion.controller.js'

const registrarLog = async (id_alianza, evento, id_usuario = null, detalle = null) => {
  try {
    await prisma.alianzaLog.create({ data: { id_alianza, evento, id_usuario, detalle } })
  } catch (err) { console.error("Error registrando AlianzaLog:", err) }
}

const notificarAdmins = async (titulo, mensaje, url) => {
  const admins = await prisma.user.findMany({ where: { rol: "admin" }, select: { id: true } })
  await Promise.all(admins.map(a => crearNotificacion(a.id, "alianza", titulo, mensaje, url)))
}

// GET /api/alianzas — listar alianzas de la emprendedora
export const listarAlianzas = async (req, res) => {
  try {
    const alianzas = await prisma.alianza.findMany({
      where: {
        OR: [
          { creada_por: req.user.id },
          { participantes: { some: { id_usuario: req.user.id } } },
        ],
      },
      include: {
        creador: { select: { nombre: true, email: true } },
        participantes: { include: { usuario: { select: { nombre: true, email: true } } } },
      },
      orderBy: { fecha_inicio: "desc" },
    });
    res.json(alianzas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener alianzas" });
  }
};

// POST /api/alianzas — crear alianza (RF-085/RN-073)
export const crearAlianza = async (req, res) => {
  try {
    const { nombre, descripcion, fecha_fin, id_invitada } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    // RN-073: el creador debe ser emprendedora activa
    const creador = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!creador || creador.rol !== "emprendedora" || !creador.activo) {
      return res.status(403).json({ error: "Solo emprendedoras activas pueden crear alianzas" })
    }

    // RN-073: la invitada también debe ser emprendedora activa
    const invitada = await prisma.user.findUnique({ where: { id: Number(id_invitada) } });
    if (!invitada || invitada.rol !== "emprendedora" || !invitada.activo) {
      return res.status(400).json({ error: "La invitada debe ser una emprendedora activa" });
    }

    const alianza = await prisma.$transaction(async (tx) => {
      const nueva = await tx.alianza.create({
        data: {
          nombre, descripcion,
          fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
          creada_por: req.user.id,
          estado: "pendiente",
        },
      });

      await tx.alianzaParticipante.create({
        data: { id_alianza: nueva.id_alianza, id_usuario: req.user.id, autorizado: true },
      });
      await tx.alianzaParticipante.create({
        data: { id_alianza: nueva.id_alianza, id_usuario: Number(id_invitada), autorizado: false },
      });

      await crearNotificacion(
        Number(id_invitada), "solicitud", "Solicitud de alianza",
        `${req.user.nombre || "Una emprendedora"} te invitó a la alianza "${nombre}".`, "/alianzas",
      );

      return nueva;
    });

    await registrarLog(alianza.id_alianza, "creada", req.user.id, `Invitada: ${invitada.nombre}`)
    res.status(201).json({ message: "Alianza creada", alianza });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear alianza" });
  }
};

// PUT /api/alianzas/:id/autorizar — RF-087/RN-075: autorización mutua entre participantes
export const autorizarAlianza = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);

    await prisma.alianzaParticipante.update({
      where: { id_alianza_id_usuario: { id_alianza, id_usuario: req.user.id } },
      data: { autorizado: true },
    });
    await registrarLog(id_alianza, "autorizada", req.user.id)

    const participantes = await prisma.alianzaParticipante.findMany({ where: { id_alianza } });
    const todosAutorizaron = participantes.every((p) => p.autorizado);

    // RN-080: al completarse la autorización mutua, NO se activa directo —
    // pasa a "pendiente_aprobacion" y espera al admin.
    if (todosAutorizaron) {
      const alianza = await prisma.alianza.update({
        where: { id_alianza },
        data: { estado: "pendiente_aprobacion" },
      });
      await registrarLog(id_alianza, "pendiente_aprobacion", req.user.id)
      await notificarAdmins(
        "Alianza lista para aprobación",
        `La alianza "${alianza.nombre}" ya tiene autorización mutua y espera tu aprobación.`,
        "/admin/alianzas",
      )
    }

    res.json({ message: "Autorización registrada", pendiente_aprobacion: todosAutorizaron });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al autorizar" });
  }
};

// PUT /api/admin/alianzas/:id/aprobar — RN-080, exclusivo admin
export const aprobarAlianzaAdmin = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);
    const alianza = await prisma.alianza.findUnique({ where: { id_alianza } });
    if (!alianza) return res.status(404).json({ error: "Alianza no encontrada" });
    if (alianza.estado !== "pendiente_aprobacion")
      return res.status(400).json({ error: "Esta alianza no está pendiente de aprobación" });

    await prisma.alianza.update({ where: { id_alianza }, data: { estado: "activa" } });

    // Crear sección compartida si no existe
    const seccionExistente = await prisma.seccion.findFirst({ where: { id_alianza } });
    if (!seccionExistente) {
      const creador = await prisma.emprendedora.findUnique({ where: { id_usuario: alianza.creada_por } });
      await prisma.seccion.create({
        data: { id_emprendedora: creador.id_emprendedora, nombre_seccion: `Alianza: ${alianza.nombre}`, id_alianza },
      });
    }

    await registrarLog(id_alianza, "aprobada", req.user.id)

    const participantes = await prisma.alianzaParticipante.findMany({ where: { id_alianza } })
    await Promise.all(participantes.map(p =>
      crearNotificacion(p.id_usuario, "alianza", "Alianza aprobada",
        `Tu alianza "${alianza.nombre}" fue aprobada y ya está activa.`, "/alianzas")
    ))

    res.json({ message: "Alianza aprobada y activada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al aprobar alianza" });
  }
};

// PUT /api/admin/alianzas/:id/rechazar — RN-080
export const rechazarAlianzaAdmin = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);
    const { motivo } = req.body;
    if (!motivo) return res.status(400).json({ error: "Debes indicar el motivo del rechazo" });

    const alianza = await prisma.alianza.update({
      where: { id_alianza }, data: { estado: "rechazada" },
    });
    await registrarLog(id_alianza, "rechazada", req.user.id, motivo)

    const participantes = await prisma.alianzaParticipante.findMany({ where: { id_alianza } })
    await Promise.all(participantes.map(p =>
      crearNotificacion(p.id_usuario, "alianza", "Alianza rechazada",
        `Tu alianza "${alianza.nombre}" fue rechazada. Motivo: ${motivo}`, "/alianzas")
    ))

    res.json({ message: "Alianza rechazada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al rechazar alianza" });
  }
};

// PUT /api/admin/alianzas/:id/desactivar — RN-080, el admin puede desactivar una alianza ACTIVA en cualquier momento
export const desactivarAlianzaAdmin = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);
    const { motivo } = req.body;

    const alianza = await prisma.alianza.update({
      where: { id_alianza }, data: { estado: "desactivada" },
    });
    await registrarLog(id_alianza, "desactivada", req.user.id, motivo || null)

    const participantes = await prisma.alianzaParticipante.findMany({ where: { id_alianza } })
    await Promise.all(participantes.map(p =>
      crearNotificacion(p.id_usuario, "alianza", "Alianza desactivada",
        `Tu alianza "${alianza.nombre}" fue desactivada por el administrador.${motivo ? " Motivo: " + motivo : ""}`, "/alianzas")
    ))

    res.json({ message: "Alianza desactivada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar alianza" });
  }
};

// PUT /api/alianzas/:id/finalizar — el creador puede finalizar su propia alianza activa
export const finalizarAlianza = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);
    const alianza = await prisma.alianza.findUnique({ where: { id_alianza } });
    if (!alianza) return res.status(404).json({ error: "Alianza no encontrada" });
    if (alianza.creada_por !== req.user.id) {
      return res.status(403).json({ error: "Solo el creador puede finalizar" });
    }

    await prisma.alianza.update({
      where: { id_alianza }, data: { estado: "finalizada", fecha_fin: new Date() },
    });
    await registrarLog(id_alianza, "finalizada", req.user.id)

    res.json({ message: "Alianza finalizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al finalizar alianza" });
  }
};

// GET /api/alianzas/emprendedoras — listar emprendedoras para invitar
export const listarEmprendedoras = async (req, res) => {
  try {
    const emprendedoras = await prisma.user.findMany({
      where: { rol: "emprendedora", activo: true, id: { not: req.user.id } },
      select: { id: true, nombre: true, email: true },
    });
    res.json(emprendedoras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener emprendedoras" });
  }
};

// GET /api/admin/alianzas — RF-092
export const listarTodasAlianzasAdmin = async (req, res) => {
  try {
    const alianzas = await prisma.alianza.findMany({
      include: {
        creador: { select: { nombre: true, email: true } },
        participantes: { include: { usuario: { select: { nombre: true, email: true } } } },
      },
      orderBy: { fecha_inicio: "desc" },
    });
    res.json(alianzas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener alianzas" });
  }
};

// GET /api/admin/alianzas/:id/historial — RF-090/RN-078 (solo consulta, admin o participante)
export const historialAlianza = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);

    if (req.user.rol !== "admin") {
      const esParticipante = await prisma.alianzaParticipante.findUnique({
        where: { id_alianza_id_usuario: { id_alianza, id_usuario: req.user.id } },
      });
      if (!esParticipante) return res.status(403).json({ error: "No autorizado" });
    }

    const logs = await prisma.alianzaLog.findMany({
      where: { id_alianza },
      include: { usuario: { select: { nombre: true, rol: true } } },
      orderBy: { fecha: "asc" },
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};

// POST /api/alianzas/:id/evento — tracking público (RF-089)
export const registrarEventoAlianza = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);
    const { tipo } = req.body;
    if (!["visita", "clic"].includes(tipo))
      return res.status(400).json({ error: "Tipo de evento inválido" });

    await prisma.alianzaEvento.create({ data: { id_alianza, tipo } });
    res.status(201).json({ message: "Evento registrado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar evento" });
  }
};

// Construye métricas: visitas, clics y ventas (via DetallePedido -> Producto -> Seccion.id_alianza)
const construirMetricasAlianza = async (id_alianza) => {
  const eventos = await prisma.alianzaEvento.groupBy({
    by: ["tipo"], where: { id_alianza }, _count: { tipo: true },
  });
  const visitas = eventos.find(e => e.tipo === "visita")?._count.tipo || 0;
  const clics = eventos.find(e => e.tipo === "clic")?._count.tipo || 0;

  const secciones = await prisma.seccion.findMany({ where: { id_alianza }, select: { id_seccion: true } });
  const idsSeccion = secciones.map(s => s.id_seccion);

  const ventas = await prisma.detallePedido.findMany({
    where: { producto: { id_seccion: { in: idsSeccion } } },
    select: { cantidad: true, precio_unit: true },
  });
  const totalVentas = ventas.reduce((acc, v) => acc + v.cantidad, 0);
  const ingresoTotal = ventas.reduce((acc, v) => acc + (v.cantidad * Number(v.precio_unit)), 0);

  return { visitas, clics, total_ventas: totalVentas, ingreso_total: ingresoTotal };
};

// GET /api/alianzas/:id/metricas — RF-089, accesible a participantes y admin (RN-077)
export const metricasAlianza = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);

    if (req.user.rol !== "admin") {
      const esParticipante = await prisma.alianzaParticipante.findUnique({
        where: { id_alianza_id_usuario: { id_alianza, id_usuario: req.user.id } },
      });
      if (!esParticipante) return res.status(403).json({ error: "No autorizado" });
    }

    res.json(await construirMetricasAlianza(id_alianza));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener métricas" });
  }
};

// GET /api/admin/alianzas/metricas/export?formato=pdf|excel — RN-077
export const exportarMetricasAlianzas = async (req, res) => {
  try {
    const formato = req.query.formato === "excel" ? "excel" : "pdf";
    const alianzas = await prisma.alianza.findMany({ where: { estado: "activa" } });

    const filas = []
    for (const a of alianzas) {
      const m = await construirMetricasAlianza(a.id_alianza)
      filas.push({ nombre: a.nombre, ...m })
    }

    if (formato === "excel") {
      const { default: XLSX } = await import("xlsx")
      const hoja = XLSX.utils.json_to_sheet(filas.map(f => ({
        Alianza: f.nombre, Visitas: f.visitas, Clics: f.clics, Ventas: f.total_ventas, Ingresos: f.ingreso_total,
      })))
      const libro = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(libro, hoja, "Alianzas")
      const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" })

      res.setHeader("Content-Disposition", "attachment; filename=metricas_alianzas.xlsx")
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      return res.send(buffer)
    }

    const { default: PDFDocument } = await import("pdfkit")
    const doc = new PDFDocument({ margin: 40 })
    res.setHeader("Content-Disposition", "attachment; filename=metricas_alianzas.pdf")
    res.setHeader("Content-Type", "application/pdf")
    doc.pipe(res)

    doc.fontSize(16).text("Métricas de Alianzas Promocionales", { align: "center" })
    doc.moveDown(1)
    filas.forEach((f) => {
      doc.fontSize(11).text(f.nombre)
      doc.fontSize(9).fillColor("#64748b")
        .text(`Visitas: ${f.visitas}   Clics: ${f.clics}   Ventas: ${f.total_ventas}   Ingresos: $${f.ingreso_total.toLocaleString("es-CO")}`)
      doc.fillColor("#000").moveDown(0.7)
    })
    doc.end()
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al exportar métricas" });
  }
};

// GET /api/alianzas/:id/seccion
export const obtenerSeccionAlianza = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);
    const seccion = await prisma.seccion.findFirst({ where: { id_alianza } });
    if (!seccion) return res.status(404).json({ error: "Sección no encontrada" });
    res.json(seccion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener sección" });
  }
};

// GET /api/alianzas/mis-secciones
export const misSeccionesAlianza = async (req, res) => {
  try {
    const alianzas = await prisma.alianza.findMany({
      where: {
        estado: "activa",
        OR: [{ creada_por: req.user.id }, { participantes: { some: { id_usuario: req.user.id, autorizado: true } } }],
      },
      include: { secciones: true },
    });
    const secciones = alianzas.flatMap((a) =>
      a.secciones.map((s) => ({ ...s, nombre_alianza: a.nombre, id_alianza: a.id_alianza })),
    );
    res.json(secciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener secciones" });
  }
};

// GET /api/publico/alianza/:id — RF-093 (lectura), y contabiliza "visita" (RF-089)
export const tiendaAlianzaPublica = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id);
    const alianza = await prisma.alianza.findUnique({
      where: { id_alianza },
      include: {
        participantes: { include: { usuario: { include: { emprendedora: { include: { secciones: { include: { productos: { where: { estado_producto: "activo", visible: true }, include: { inventario: true } } } } } } } } } },
        secciones: { include: { productos: { where: { estado_producto: "activo", visible: true }, include: { inventario: true } } } },
      },
    });
    if (!alianza) return res.status(404).json({ error: "Alianza no encontrada" });
    res.json(alianza);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener alianza" });
  }
};

// GET /api/publico/alianzas — RF-088/RN-076: solo "activa" Y vigente en fechas
export const listarAlianzasPublicas = async (req, res) => {
  try {
    const ahora = new Date();
    const alianzas = await prisma.alianza.findMany({
      where: {
        estado: "activa",
        OR: [{ fecha_fin: null }, { fecha_fin: { gte: ahora } }],
      },
      include: {
        participantes: { include: { usuario: { select: { nombre: true } } } },
        secciones: {
          include: {
            productos: {
              where: { estado_producto: "activo", visible: true }, take: 3,
              select: { id_producto: true, nombre_producto: true, imagen: true, precio: true },
            },
          },
        },
      },
      orderBy: { fecha_inicio: "desc" },
    });
    res.json(alianzas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener alianzas" });
  }
};

// Job automático — RN-076: mueve a "finalizada" las alianzas activas cuya fecha_fin ya pasó
export const vencerAlianzasExpiradas = async () => {
  try {
    const ahora = new Date();
    const vencidas = await prisma.alianza.findMany({
      where: { estado: "activa", fecha_fin: { lt: ahora } },
      select: { id_alianza: true },
    });
    if (vencidas.length === 0) return;

    await prisma.alianza.updateMany({
      where: { id_alianza: { in: vencidas.map(v => v.id_alianza) } },
      data: { estado: "finalizada" },
    });
    for (const v of vencidas) await registrarLog(v.id_alianza, "vencida")

    console.log(`[alianzas] ${vencidas.length} alianza(s) marcada(s) como finalizadas por vencimiento`)
  } catch (err) {
    console.error("Error al vencer alianzas expiradas:", err)
  }
};
