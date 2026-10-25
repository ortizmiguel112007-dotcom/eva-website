import {
  obtenerFechaColombia,
  obtenerHoraColombia,
  obtenerDiaSemanaColombia,
} from "../utils/fecha.js";
import { crearNotificacion } from "./notificacion.controller.js";
import prisma from "../conexion.js";

/* ──────────────────────────────────────────────────────────────
   Constantes y utilidades
   ────────────────────────────────────────────────────────────── */

const MODALIDADES = ["presencial", "domicilio", "virtual"];
const ESTADOS_ACTIVOS = ["PENDIENTE", "CONFIRMADA"];
const MINUTO = 60_000;

const validarHora = (hora) =>
  typeof hora === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const aHHMM = (minutos) =>
  `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(
    minutos % 60,
  ).padStart(2, "0")}`;

// Colombia no tiene horario de verano: siempre UTC-5.
const fechaColombiaADate = (fecha /* YYYY-MM-DD */, hhmm /* HH:mm */) =>
  new Date(`${fecha}T${hhmm}:00-05:00`);

const esFechaISO = (valor) =>
  typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor);

const mismoDiaColombia = (a, b) => {
  const x = obtenerFechaColombia(a);
  const y = obtenerFechaColombia(b);
  return x.anio === y.anio && x.mes === y.mes && x.dia === y.dia;
};

const idValido = (valor) => {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const fechaLegible = (fecha) =>
  new Date(fecha).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  });

const obtenerEmprendedoraDeUsuario = (id_usuario) =>
  prisma.emprendedora.findUnique({
    where: { id_usuario },
    select: { id_emprendedora: true },
  });

// Carga la cita y determina qué papel juega el usuario autenticado.
const cargarCitaConRol = async (id_cita, id_usuario, include = undefined) => {
  const cita = await prisma.cita.findUnique({
    where: { id_cita },
    include: {
      emprendedora: { select: { id_usuario: true } },
      ...(include ?? {}),
    },
  });

  if (!cita) return { cita: null };

  const esCliente = cita.id_cliente === id_usuario;
  const esEmprendedora = cita.emprendedora?.id_usuario === id_usuario;

  return { cita, esCliente, esEmprendedora };
};

/**
 * Valida que un horario sea reservable (RN-092, RN-093, RN-097):
 *  - fecha futura
 *  - empieza y termina el mismo día (hora de Colombia)
 *  - cabe dentro de una franja activa con esa modalidad
 *  - no se cruza con citas pendientes o confirmadas
 */
const validarHorario = async ({
  id_emprendedora,
  inicio,
  duracionMinutos,
  modalidad,
  excluirCita = null,
}) => {
  if (inicio <= new Date()) {
    return { ok: false, status: 400, error: "La fecha debe ser futura." };
  }

  const fin = new Date(inicio.getTime() + duracionMinutos * MINUTO);

  if (!mismoDiaColombia(inicio, fin)) {
    return {
      ok: false,
      status: 400,
      error: "La cita debe comenzar y terminar el mismo día.",
    };
  }

  const disponibilidad = await prisma.disponibilidad.findFirst({
    where: {
      id_emprendedora,
      dia_semana: obtenerDiaSemanaColombia(inicio),
      activa: true,
      modalidad,
      hora_inicio: { lte: obtenerHoraColombia(inicio) },
      hora_fin: { gte: obtenerHoraColombia(fin) },
    },
  });

  if (!disponibilidad) {
    return {
      ok: false,
      status: 400,
      error: "El servicio no está disponible en ese horario o modalidad.",
    };
  }

  const conflicto = await prisma.cita.findFirst({
    where: {
      id_emprendedora,
      ...(excluirCita ? { id_cita: { not: excluirCita } } : {}),
      estado: { in: ESTADOS_ACTIVOS },
      fecha_inicio: { lt: fin },
      fecha_fin: { gt: inicio },
    },
    select: { id_cita: true },
  });

  if (conflicto) {
    return {
      ok: false,
      status: 409,
      error: "Ese horario ya tiene una solicitud o una cita reservada.",
    };
  }

  return { ok: true, fin, disponibilidad };
};

/* ──────────────────────────────────────────────────────────────
   RF-111 · Disponibilidad de la emprendedora
   ────────────────────────────────────────────────────────────── */

export const crearDisponibilidad = async (req, res) => {
  try {
    const { dia_semana, hora_inicio, hora_fin, modalidad, lugar } = req.body;
    const dia = Number(dia_semana);

    if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
      return res.status(400).json({
        error: "El día debe ser un número entre 0 (domingo) y 6 (sábado).",
      });
    }
    if (!validarHora(hora_inicio) || !validarHora(hora_fin)) {
      return res
        .status(400)
        .json({ error: "Las horas deben tener el formato HH:mm." });
    }
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({
        error: "La hora de inicio debe ser anterior a la hora de fin.",
      });
    }
    if (!MODALIDADES.includes(modalidad)) {
      return res.status(400).json({
        error: "La modalidad debe ser presencial, domicilio o virtual.",
      });
    }
    if (modalidad !== "virtual" && !lugar?.trim()) {
      return res
        .status(400)
        .json({ error: "Indica el lugar de atención para esta modalidad." });
    }

    const emprendedora = await obtenerEmprendedoraDeUsuario(req.user.id);
    if (!emprendedora) {
      return res
        .status(403)
        .json({ error: "Solo una emprendedora puede publicar disponibilidad." });
    }

    const conflictos = await prisma.disponibilidad.count({
      where: {
        id_emprendedora: emprendedora.id_emprendedora,
        dia_semana: dia,
        activa: true,
        hora_inicio: { lt: hora_fin },
        hora_fin: { gt: hora_inicio },
      },
    });
    if (conflictos > 0) {
      return res.status(409).json({
        error: "Este horario se cruza con otra franja de disponibilidad.",
      });
    }

    const disponibilidad = await prisma.disponibilidad.create({
      data: {
        id_emprendedora: emprendedora.id_emprendedora,
        dia_semana: dia,
        hora_inicio,
        hora_fin,
        modalidad,
        lugar: modalidad === "virtual" ? null : lugar.trim(),
      },
    });

    return res.status(201).json(disponibilidad);
  } catch (error) {
    console.error("Error al crear disponibilidad:", error);
    return res
      .status(500)
      .json({ error: "No se pudo guardar la disponibilidad." });
  }
};

export const obtenerMiDisponibilidad = async (req, res) => {
  try {
    const emprendedora = await obtenerEmprendedoraDeUsuario(req.user.id);
    if (!emprendedora) {
      return res
        .status(403)
        .json({ error: "No se encontró el perfil de emprendedora." });
    }

    const horarios = await prisma.disponibilidad.findMany({
      where: { id_emprendedora: emprendedora.id_emprendedora },
      orderBy: [{ dia_semana: "asc" }, { hora_inicio: "asc" }],
    });

    return res.json(horarios);
  } catch (error) {
    console.error("Error al consultar disponibilidad:", error);
    return res
      .status(500)
      .json({ error: "No se pudo consultar la disponibilidad." });
  }
};

// Editar una franja o volver a activarla.
export const actualizarDisponibilidad = async (req, res) => {
  try {
    const id_disponibilidad = idValido(req.params.id);
    if (!id_disponibilidad) {
      return res
        .status(400)
        .json({ error: "Identificador de horario inválido." });
    }

    const emprendedora = await obtenerEmprendedoraDeUsuario(req.user.id);
    if (!emprendedora) {
      return res
        .status(403)
        .json({ error: "No se encontró el perfil de emprendedora." });
    }

    const actual = await prisma.disponibilidad.findFirst({
      where: {
        id_disponibilidad,
        id_emprendedora: emprendedora.id_emprendedora,
      },
    });
    if (!actual) {
      return res.status(404).json({ error: "Horario no encontrado." });
    }

    const hora_inicio = req.body.hora_inicio ?? actual.hora_inicio;
    const hora_fin = req.body.hora_fin ?? actual.hora_fin;
    const modalidad = req.body.modalidad ?? actual.modalidad;
    const activa =
      typeof req.body.activa === "boolean" ? req.body.activa : actual.activa;
    const lugarRecibido =
      req.body.lugar !== undefined ? req.body.lugar : actual.lugar;
    const dia =
      req.body.dia_semana !== undefined
        ? Number(req.body.dia_semana)
        : actual.dia_semana;

    if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
      return res.status(400).json({ error: "Día de la semana inválido." });
    }
    if (!validarHora(hora_inicio) || !validarHora(hora_fin)) {
      return res
        .status(400)
        .json({ error: "Las horas deben tener el formato HH:mm." });
    }
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({
        error: "La hora de inicio debe ser anterior a la hora de fin.",
      });
    }
    if (!MODALIDADES.includes(modalidad)) {
      return res.status(400).json({ error: "Modalidad no válida." });
    }
    if (modalidad !== "virtual" && !String(lugarRecibido ?? "").trim()) {
      return res
        .status(400)
        .json({ error: "Indica el lugar de atención para esta modalidad." });
    }

    if (activa) {
      const cruce = await prisma.disponibilidad.count({
        where: {
          id_emprendedora: emprendedora.id_emprendedora,
          id_disponibilidad: { not: id_disponibilidad },
          dia_semana: dia,
          activa: true,
          hora_inicio: { lt: hora_fin },
          hora_fin: { gt: hora_inicio },
        },
      });
      if (cruce > 0) {
        return res.status(409).json({
          error: "Este horario se cruza con otra franja de disponibilidad.",
        });
      }
    }

    const actualizado = await prisma.disponibilidad.update({
      where: { id_disponibilidad },
      data: {
        dia_semana: dia,
        hora_inicio,
        hora_fin,
        modalidad,
        activa,
        lugar: modalidad === "virtual" ? null : String(lugarRecibido).trim(),
      },
    });

    return res.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    return res
      .status(500)
      .json({ error: "No se pudo actualizar el horario." });
  }
};

export const desactivarDisponibilidad = async (req, res) => {
  try {
    const id_disponibilidad = idValido(req.params.id);
    if (!id_disponibilidad) {
      return res
        .status(400)
        .json({ error: "Identificador de horario inválido." });
    }

    const emprendedora = await obtenerEmprendedoraDeUsuario(req.user.id);
    if (!emprendedora) {
      return res
        .status(403)
        .json({ error: "No se encontró el perfil de emprendedora." });
    }

    const resultado = await prisma.disponibilidad.updateMany({
      where: {
        id_disponibilidad,
        id_emprendedora: emprendedora.id_emprendedora,
        activa: true,
      },
      data: { activa: false },
    });

    if (resultado.count === 0) {
      return res
        .status(404)
        .json({ error: "Horario no encontrado o ya desactivado." });
    }

    return res.json({ message: "Horario desactivado correctamente." });
  } catch (error) {
    console.error("Error al desactivar disponibilidad:", error);
    return res.status(500).json({ error: "No se pudo desactivar el horario." });
  }
};

/* ──────────────────────────────────────────────────────────────
   RF-104 · Consulta pública de disponibilidad
   ────────────────────────────────────────────────────────────── */

// Franjas semanales habituales (solo las habilitadas: RN-092).
export const obtenerDisponibilidadPublica = async (req, res) => {
  try {
    const id_emprendedora = idValido(req.params.id_emprendedora);
    if (!id_emprendedora) {
      return res
        .status(400)
        .json({ error: "Identificador de emprendedora inválido." });
    }

    const emprendedora = await prisma.emprendedora.findFirst({
      where: {
        id_emprendedora,
        estado: true,
        usuario: { activo: true, verificado: true },
      },
      select: { id_emprendedora: true },
    });
    if (!emprendedora) {
      return res
        .status(404)
        .json({ error: "Emprendedora no encontrada o no disponible." });
    }

    const horarios = await prisma.disponibilidad.findMany({
      where: { id_emprendedora, activa: true },
      select: {
        id_disponibilidad: true,
        dia_semana: true,
        hora_inicio: true,
        hora_fin: true,
        modalidad: true,
        lugar: true,
      },
      orderBy: [{ dia_semana: "asc" }, { hora_inicio: "asc" }],
    });

    return res.json(horarios);
  } catch (error) {
    console.error("Error al consultar agenda pública:", error);
    return res
      .status(500)
      .json({ error: "No se pudo consultar la disponibilidad." });
  }
};

// Horas concretas libres para un servicio en una fecha determinada.
// GET /api/agenda/horarios?id_producto=1&fecha=2026-11-03[&modalidad=virtual]
export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const id_producto = idValido(req.query.id_producto);
    const { fecha, modalidad } = req.query;

    if (!id_producto || !esFechaISO(fecha)) {
      return res.status(400).json({
        error: "Indica el servicio y la fecha (AAAA-MM-DD).",
      });
    }
    if (modalidad && !MODALIDADES.includes(modalidad)) {
      return res.status(400).json({ error: "La modalidad no es válida." });
    }

    const servicio = await prisma.producto.findFirst({
      where: {
        id_producto,
        tipo: "servicio",
        estado_producto: "activo",
        visible: true,
        seccion: {
          id_alianza: null,
          emprendedora: {
            estado: true,
            usuario: { activo: true, verificado: true },
          },
        },
      },
      select: {
        id_producto: true,
        nombre_producto: true,
        duracion: true,
        seccion: { select: { id_emprendedora: true } },
      },
    });

    if (!servicio) {
      return res
        .status(404)
        .json({ error: "El servicio no existe o no está disponible." });
    }

    const duracion = Number(servicio.duracion);
    if (!Number.isInteger(duracion) || duracion <= 0) {
      return res.status(400).json({
        error: "Este servicio no tiene una duración válida configurada.",
      });
    }

    const id_emprendedora = servicio.seccion.id_emprendedora;
    const inicioDia = fechaColombiaADate(fecha, "00:00");
    if (Number.isNaN(inicioDia.getTime())) {
      return res.status(400).json({ error: "Fecha inválida." });
    }
    const finDia = new Date(inicioDia.getTime() + 24 * 60 * MINUTO);
    const dia_semana = obtenerDiaSemanaColombia(inicioDia);

    const [franjas, ocupadas] = await Promise.all([
      prisma.disponibilidad.findMany({
        where: {
          id_emprendedora,
          dia_semana,
          activa: true,
          ...(modalidad ? { modalidad } : {}),
        },
        orderBy: { hora_inicio: "asc" },
      }),
      prisma.cita.findMany({
        where: {
          id_emprendedora,
          estado: { in: ESTADOS_ACTIVOS },
          fecha_inicio: { lt: finDia },
          fecha_fin: { gt: inicioDia },
        },
        select: { fecha_inicio: true, fecha_fin: true },
      }),
    ]);

    const ahora = new Date();
    const horarios = [];

    for (const franja of franjas) {
      const limite = aMinutos(franja.hora_fin);
      for (
        let cursor = aMinutos(franja.hora_inicio);
        cursor + duracion <= limite;
        cursor += duracion
      ) {
        const inicio = fechaColombiaADate(fecha, aHHMM(cursor));
        const fin = new Date(inicio.getTime() + duracion * MINUTO);

        if (inicio <= ahora) continue;

        const ocupado = ocupadas.some(
          (c) => c.fecha_inicio < fin && c.fecha_fin > inicio,
        );
        if (ocupado) continue;

        horarios.push({
          inicio: inicio.toISOString(),
          fin: fin.toISOString(),
          hora_inicio: aHHMM(cursor),
          hora_fin: aHHMM(cursor + duracion),
          modalidad: franja.modalidad,
          lugar: franja.lugar,
        });
      }
    }

    horarios.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

    return res.json({
      servicio: {
        id_producto: servicio.id_producto,
        nombre_producto: servicio.nombre_producto,
        duracion,
      },
      fecha,
      horarios,
    });
  } catch (error) {
    console.error("Error al consultar horarios disponibles:", error);
    return res
      .status(500)
      .json({ error: "No se pudieron consultar los horarios disponibles." });
  }
};

/* ──────────────────────────────────────────────────────────────
   RF-105 · Solicitar cita
   ────────────────────────────────────────────────────────────── */

export const crearCita = async (req, res) => {
  try {
    const id_cliente = req.user.id;
    const { id_producto, fecha_inicio, modalidad, lugar, observaciones } =
      req.body;

    const idProducto = idValido(id_producto);
    const inicio = new Date(fecha_inicio);

    if (!idProducto || !fecha_inicio || Number.isNaN(inicio.getTime())) {
      return res
        .status(400)
        .json({ error: "Debes indicar un servicio y una fecha válida." });
    }
    if (!MODALIDADES.includes(modalidad)) {
      return res.status(400).json({ error: "La modalidad no es válida." });
    }
    if (
      modalidad === "domicilio" &&
      (typeof lugar !== "string" || !lugar.trim())
    ) {
      return res.status(400).json({
        error: "Indica la dirección donde se prestará el servicio a domicilio.",
      });
    }
    if (typeof observaciones === "string" && observaciones.length > 1000) {
      return res
        .status(400)
        .json({ error: "Las observaciones no pueden superar 1000 caracteres." });
    }

    const servicio = await prisma.producto.findFirst({
      where: {
        id_producto: idProducto,
        tipo: "servicio",
        estado_producto: "activo",
        visible: true,
        seccion: {
          id_alianza: null,
          emprendedora: {
            estado: true,
            usuario: { activo: true, verificado: true },
          },
        },
      },
      include: {
        seccion: {
          select: {
            id_emprendedora: true,
            emprendedora: { select: { id_usuario: true } },
          },
        },
      },
    });

    if (!servicio) {
      return res
        .status(404)
        .json({ error: "El servicio no existe o no está disponible." });
    }

    const id_emprendedora = servicio.seccion.id_emprendedora;

    if (servicio.seccion.emprendedora.id_usuario === id_cliente) {
      return res
        .status(400)
        .json({ error: "No puedes reservar tu propio servicio." });
    }

    const duracionMinutos = Number(servicio.duracion);
    if (!Number.isInteger(duracionMinutos) || duracionMinutos <= 0) {
      return res.status(400).json({
        error: "Este servicio no tiene una duración válida configurada.",
      });
    }

    const validacion = await validarHorario({
      id_emprendedora,
      inicio,
      duracionMinutos,
      modalidad,
    });
    if (!validacion.ok) {
      return res.status(validacion.status).json({ error: validacion.error });
    }

    // Presencial: el lugar lo define la emprendedora en su franja.
    // Domicilio: lo indica el cliente. Virtual: no aplica.
    let lugarFinal = null;
    if (modalidad === "presencial") lugarFinal = validacion.disponibilidad.lugar;
    if (modalidad === "domicilio") lugarFinal = lugar.trim();

    const cita = await prisma.cita.create({
      data: {
        id_cliente,
        id_emprendedora,
        id_producto: idProducto,
        fecha_inicio: inicio,
        fecha_fin: validacion.fin,
        modalidad,
        lugar: lugarFinal,
        observaciones: observaciones?.trim() || null,
        estado: "PENDIENTE",
      },
    });

    await crearNotificacion(
      servicio.seccion.emprendedora.id_usuario,
      "cita",
      "Nueva solicitud de cita",
      `${req.user.nombre ?? "Un cliente"} solicitó "${servicio.nombre_producto}" para el ${fechaLegible(inicio)}.`,
      "/gestion-citas",
    );

    return res.status(201).json({
      message:
        "Solicitud de cita enviada. Espera la confirmación de la emprendedora.",
      cita,
    });
  } catch (error) {
    console.error("Error al crear cita:", error);
    return res
      .status(500)
      .json({ error: "No se pudo crear la solicitud de cita." });
  }
};

/* ──────────────────────────────────────────────────────────────
   RF-107 / RF-106 · Consultar citas
   ────────────────────────────────────────────────────────────── */

const incluirCambios = {
  orderBy: { fecha_creacion: "desc" },
  include: { proponente: { select: { id: true, nombre: true, rol: true } } },
};

const incluirServicio = {
  select: {
    id_producto: true,
    nombre_producto: true,
    duracion: true,
    precio: true,
    imagen: true,
  },
};

// RN-095: el cliente solo ve sus propias citas.
export const obtenerMisCitas = async (req, res) => {
  try {
    const citas = await prisma.cita.findMany({
      where: { id_cliente: req.user.id },
      orderBy: { fecha_inicio: "desc" },
      include: {
        servicio: incluirServicio,
        cambios: incluirCambios,
        emprendedora: {
          select: {
            id_emprendedora: true,
            usuario: { select: { nombre: true } },
          },
        },
      },
    });

    return res.json(citas);
  } catch (error) {
    console.error("Error al obtener las citas del cliente:", error);
    return res.status(500).json({ error: "No se pudieron obtener tus citas." });
  }
};

export const obtenerCitasRecibidas = async (req, res) => {
  try {
    const emprendedora = await obtenerEmprendedoraDeUsuario(req.user.id);
    if (!emprendedora) {
      return res
        .status(403)
        .json({ error: "Tu cuenta no está asociada a una emprendedora." });
    }

    const citas = await prisma.cita.findMany({
      where: { id_emprendedora: emprendedora.id_emprendedora },
      orderBy: { fecha_inicio: "desc" },
      include: {
        servicio: incluirServicio,
        cambios: incluirCambios,
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true },
        },
      },
    });

    return res.json(citas);
  } catch (error) {
    console.error("Error al obtener las citas recibidas:", error);
    return res
      .status(500)
      .json({ error: "No se pudieron obtener las citas recibidas." });
  }
};

/* ──────────────────────────────────────────────────────────────
   RF-106 · Confirmar / rechazar solicitud
   ────────────────────────────────────────────────────────────── */

export const responderCita = async (req, res) => {
  try {
    const id_cita = idValido(req.params.id);
    const { estado, motivo_rechazo } = req.body;

    if (!id_cita) {
      return res
        .status(400)
        .json({ error: "El identificador de la cita no es válido." });
    }
    if (!["CONFIRMADA", "RECHAZADA"].includes(estado)) {
      return res
        .status(400)
        .json({ error: "El estado debe ser CONFIRMADA o RECHAZADA." });
    }
    if (
      motivo_rechazo !== undefined &&
      (typeof motivo_rechazo !== "string" || motivo_rechazo.length > 1000)
    ) {
      return res.status(400).json({
        error: "El motivo de rechazo debe ser texto de máximo 1000 caracteres.",
      });
    }

    const emprendedora = await obtenerEmprendedoraDeUsuario(req.user.id);
    if (!emprendedora) {
      return res
        .status(403)
        .json({ error: "Tu cuenta no está asociada a una emprendedora." });
    }

    // RN-094: solo citas de sus servicios y en estado pendiente.
    const cita = await prisma.cita.findFirst({
      where: { id_cita, id_emprendedora: emprendedora.id_emprendedora },
      include: { servicio: { select: { nombre_producto: true } } },
    });
    if (!cita) {
      return res.status(404).json({
        error: "No se encontró la cita o no tienes permiso para gestionarla.",
      });
    }
    if (cita.estado !== "PENDIENTE") {
      return res
        .status(409)
        .json({ error: "Solo puedes responder citas que estén pendientes." });
    }

    if (estado === "CONFIRMADA") {
      if (cita.fecha_inicio <= new Date()) {
        return res.status(409).json({
          error: "No puedes confirmar una cita cuya fecha ya pasó.",
        });
      }

      const conflicto = await prisma.cita.findFirst({
        where: {
          id_emprendedora: emprendedora.id_emprendedora,
          id_cita: { not: id_cita },
          estado: "CONFIRMADA",
          fecha_inicio: { lt: cita.fecha_fin },
          fecha_fin: { gt: cita.fecha_inicio },
        },
        select: { id_cita: true },
      });
      if (conflicto) {
        return res.status(409).json({
          error:
            "No puedes confirmar la cita porque se cruza con otra cita confirmada.",
        });
      }
    }

    // updateMany con estado PENDIENTE evita responder dos veces la misma cita.
    const actualizado = await prisma.cita.updateMany({
      where: { id_cita, estado: "PENDIENTE" },
      data: {
        estado,
        motivo_rechazo:
          estado === "RECHAZADA" ? motivo_rechazo?.trim() || null : null,
      },
    });
    if (actualizado.count === 0) {
      return res
        .status(409)
        .json({ error: "Esta solicitud ya fue respondida." });
    }

    const citaActualizada = await prisma.cita.findUnique({ where: { id_cita } });

    await crearNotificacion(
      cita.id_cliente,
      "cita",
      estado === "CONFIRMADA" ? "Cita confirmada" : "Solicitud de cita rechazada",
      estado === "CONFIRMADA"
        ? `Tu cita de "${cita.servicio.nombre_producto}" para el ${fechaLegible(cita.fecha_inicio)} fue confirmada.`
        : `Tu solicitud de "${cita.servicio.nombre_producto}" fue rechazada.${motivo_rechazo?.trim() ? ` Motivo: ${motivo_rechazo.trim()}` : ""}`,
      "/mis-citas",
    );

    return res.json({
      message:
        estado === "CONFIRMADA"
          ? "La cita fue confirmada."
          : "La cita fue rechazada.",
      cita: citaActualizada,
    });
  } catch (error) {
    console.error("Error al responder la cita:", error);
    return res
      .status(500)
      .json({ error: "No se pudo actualizar el estado de la cita." });
  }
};

// Cancelación por cualquiera de las dos partes (solicitud o cita confirmada).
export const cancelarCita = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const id_cita = idValido(req.params.id);
    const motivo = typeof req.body?.motivo === "string" ? req.body.motivo : "";

    if (!id_cita) {
      return res
        .status(400)
        .json({ error: "El identificador de la cita no es válido." });
    }
    if (motivo.length > 1000) {
      return res
        .status(400)
        .json({ error: "El motivo no puede superar 1000 caracteres." });
    }

    const { cita, esCliente, esEmprendedora } = await cargarCitaConRol(
      id_cita,
      id_usuario,
      { servicio: { select: { nombre_producto: true } } },
    );

    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (!esCliente && !esEmprendedora) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para cancelar esta cita." });
    }
    if (!ESTADOS_ACTIVOS.includes(cita.estado)) {
      return res.status(409).json({
        error: "Solo se pueden cancelar citas pendientes o confirmadas.",
      });
    }
    if (cita.fecha_inicio <= new Date()) {
      return res
        .status(409)
        .json({ error: "No puedes cancelar una cita que ya comenzó o pasó." });
    }

    await prisma.$transaction([
      prisma.cita.update({
        where: { id_cita },
        data: { estado: "CANCELADA", motivo_rechazo: motivo.trim() || null },
      }),
      prisma.citaCambio.updateMany({
        where: { id_cita, estado: "PENDIENTE" },
        data: {
          estado: "RECHAZADA",
          respuesta: "La cita fue cancelada.",
          fecha_respuesta: new Date(),
        },
      }),
    ]);

    const destinatario = esCliente
      ? cita.emprendedora.id_usuario
      : cita.id_cliente;

    await crearNotificacion(
      destinatario,
      "cita",
      "Cita cancelada",
      `La cita de "${cita.servicio.nombre_producto}" del ${fechaLegible(cita.fecha_inicio)} fue cancelada por ${esCliente ? "el cliente" : "la emprendedora"}.${motivo.trim() ? ` Motivo: ${motivo.trim()}` : ""}`,
      esCliente ? "/gestion-citas" : "/mis-citas",
    );

    return res.json({ message: "La cita fue cancelada." });
  } catch (error) {
    console.error("Error al cancelar la cita:", error);
    return res.status(500).json({ error: "No se pudo cancelar la cita." });
  }
};

/* ──────────────────────────────────────────────────────────────
   RF-108 · El cliente propone un cambio de fecha y hora
   ────────────────────────────────────────────────────────────── */

export const proponerCambioCita = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const id_cita = idValido(req.params.id);
    const { fecha_inicio, modalidad, lugar } = req.body;

    if (!id_cita) {
      return res.status(400).json({ error: "ID de cita no válido." });
    }

    const tieneZonaHoraria =
      typeof fecha_inicio === "string" &&
      /(?:Z|[+-]\d{2}:\d{2})$/i.test(fecha_inicio);
    const inicio = new Date(fecha_inicio);

    if (!tieneZonaHoraria || Number.isNaN(inicio.getTime())) {
      return res
        .status(400)
        .json({ error: "Indica una fecha ISO válida con zona horaria." });
    }
    if (!MODALIDADES.includes(modalidad)) {
      return res.status(400).json({ error: "Modalidad no válida." });
    }

    const { cita, esCliente, esEmprendedora } = await cargarCitaConRol(
      id_cita,
      id_usuario,
      { servicio: { select: { duracion: true, nombre_producto: true } } },
    );

    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (!esCliente && !esEmprendedora) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para modificar esta cita." });
    }
    // RF-108: la propuesta la realiza el cliente.
    if (!esCliente) {
      return res.status(403).json({
        error:
          "Solo el cliente puede proponer cambios de horario. Puedes aceptar o rechazar sus propuestas.",
      });
    }
    // RN-096
    if (cita.estado !== "CONFIRMADA") {
      return res
        .status(409)
        .json({ error: "Solo se pueden reprogramar citas confirmadas." });
    }
    if (cita.fecha_inicio <= new Date()) {
      return res
        .status(409)
        .json({ error: "No puedes reprogramar una cita que ya pasó." });
    }

    const cambioPendiente = await prisma.citaCambio.findFirst({
      where: { id_cita, estado: "PENDIENTE" },
      select: { id_cambio: true },
    });
    if (cambioPendiente) {
      return res
        .status(409)
        .json({ error: "Esta cita ya tiene una propuesta pendiente." });
    }

    const duracion = cita.servicio.duracion;
    if (!Number.isInteger(duracion) || duracion <= 0) {
      return res
        .status(400)
        .json({ error: "El servicio no tiene una duración válida." });
    }

    if (modalidad === "domicilio" && !(typeof lugar === "string" && lugar.trim())) {
      return res.status(400).json({
        error: "Indica la dirección para la atención a domicilio.",
      });
    }

    const validacion = await validarHorario({
      id_emprendedora: cita.id_emprendedora,
      inicio,
      duracionMinutos: duracion,
      modalidad,
      excluirCita: id_cita,
    });
    if (!validacion.ok) {
      return res.status(validacion.status).json({ error: validacion.error });
    }

    let lugarPropuesto = null;
    if (modalidad === "presencial") {
      lugarPropuesto = validacion.disponibilidad.lugar;
      if (!lugarPropuesto?.trim()) {
        return res
          .status(400)
          .json({ error: "La ubicación presencial no está configurada." });
      }
    }
    if (modalidad === "domicilio") lugarPropuesto = lugar.trim();

    const cambio = await prisma.citaCambio.create({
      data: {
        id_cita,
        id_proponente: id_usuario,
        fecha_inicio_propuesta: inicio,
        fecha_fin_propuesta: validacion.fin,
        modalidad_propuesta: modalidad,
        lugar_propuesto: lugarPropuesto,
        fecha_inicio_original: cita.fecha_inicio,
        modalidad_original: cita.modalidad,
        lugar_original: cita.lugar,
        estado: "PENDIENTE",
      },
    });

    await crearNotificacion(
      cita.emprendedora.id_usuario,
      "cita",
      "Propuesta de cambio de horario",
      `${req.user.nombre ?? "Un cliente"} propone mover "${cita.servicio.nombre_producto}" al ${fechaLegible(inicio)}.`,
      "/gestion-citas",
    );

    return res
      .status(201)
      .json({ message: "Propuesta de reprogramación enviada.", cambio });
  } catch (error) {
    console.error("Error al proponer cambio de cita:", error);
    return res
      .status(500)
      .json({ error: "No se pudo crear la propuesta de reprogramación." });
  }
};

/* ──────────────────────────────────────────────────────────────
   RF-109 · La emprendedora acepta o rechaza la propuesta
   ────────────────────────────────────────────────────────────── */

export const responderCambioCita = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const id_cita = idValido(req.params.id);
    const id_cambio = idValido(req.params.id_cambio);
    const { estado, respuesta } = req.body;

    if (!id_cita || !id_cambio) {
      return res
        .status(400)
        .json({ error: "Los identificadores no son válidos." });
    }
    if (!["ACEPTADA", "RECHAZADA"].includes(estado)) {
      return res
        .status(400)
        .json({ error: "El estado debe ser ACEPTADA o RECHAZADA." });
    }
    if (
      respuesta !== undefined &&
      (typeof respuesta !== "string" || respuesta.length > 1000)
    ) {
      return res.status(400).json({
        error: "La respuesta debe ser texto de máximo 1000 caracteres.",
      });
    }

    const { cita, esCliente, esEmprendedora } = await cargarCitaConRol(
      id_cita,
      id_usuario,
      { servicio: { select: { duracion: true, nombre_producto: true } } },
    );

    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (!esCliente && !esEmprendedora) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para responder esta propuesta." });
    }
    // RN-097: solo la emprendedora responde propuestas del cliente.
    if (!esEmprendedora) {
      return res.status(403).json({
        error: "Solo la emprendedora puede responder esta propuesta.",
      });
    }

    const cambio = await prisma.citaCambio.findFirst({
      where: { id_cambio, id_cita, estado: "PENDIENTE" },
    });
    if (!cambio) {
      return res
        .status(404)
        .json({ error: "No existe una propuesta pendiente para esta cita." });
    }
    if (cambio.id_proponente === id_usuario) {
      return res
        .status(403)
        .json({ error: "No puedes responder tu propia propuesta." });
    }
    if (cita.estado !== "CONFIRMADA") {
      return res.status(409).json({ error: "La cita ya no está confirmada." });
    }

    const nombreServicio = cita.servicio.nombre_producto;
    const textoRespuesta = respuesta?.trim() || null;

    if (estado === "RECHAZADA") {
      const resultado = await prisma.citaCambio.updateMany({
        where: { id_cambio, id_cita, estado: "PENDIENTE" },
        data: {
          estado: "RECHAZADA",
          respuesta: textoRespuesta,
          fecha_respuesta: new Date(),
        },
      });
      if (resultado.count === 0) {
        return res.status(409).json({ error: "La propuesta ya fue respondida." });
      }

      await crearNotificacion(
        cita.id_cliente,
        "cita",
        "Propuesta de cambio rechazada",
        `Tu propuesta para "${nombreServicio}" fue rechazada. Tu cita conserva su horario original.${textoRespuesta ? ` Respuesta: ${textoRespuesta}` : ""}`,
        "/mis-citas",
      );

      return res.json({ message: "Propuesta rechazada." });
    }

    // Aceptar: se valida otra vez la disponibilidad (RN-097).
    if (cambio.fecha_inicio_propuesta <= new Date()) {
      return res.status(409).json({
        error: "La fecha propuesta ya pasó. Rechaza la propuesta.",
      });
    }

    const validacion = await validarHorario({
      id_emprendedora: cita.id_emprendedora,
      inicio: cambio.fecha_inicio_propuesta,
      duracionMinutos: cita.servicio.duracion,
      modalidad: cambio.modalidad_propuesta,
      excluirCita: id_cita,
    });
    if (!validacion.ok) {
      return res.status(validacion.status).json({
        error: `No se puede aceptar: ${validacion.error}`,
      });
    }

    const citaActualizada = await prisma.$transaction(async (tx) => {
      const actualizado = await tx.citaCambio.updateMany({
        where: { id_cambio, id_cita, estado: "PENDIENTE" },
        data: {
          estado: "ACEPTADA",
          respuesta: textoRespuesta,
          fecha_respuesta: new Date(),
        },
      });
      if (actualizado.count === 0) throw new Error("PROPUESTA_YA_RESPONDIDA");

      return tx.cita.update({
        where: { id_cita },
        data: {
          fecha_inicio: cambio.fecha_inicio_propuesta,
          fecha_fin: cambio.fecha_fin_propuesta,
          modalidad: cambio.modalidad_propuesta,
          lugar: cambio.lugar_propuesto,
        },
      });
    });

    await crearNotificacion(
      cita.id_cliente,
      "cita",
      "Cambio de horario aceptado",
      `Tu cita de "${nombreServicio}" ahora es el ${fechaLegible(cambio.fecha_inicio_propuesta)}.`,
      "/mis-citas",
    );

    return res.json({
      message: "Propuesta aceptada. La cita ha sido actualizada.",
      cita: citaActualizada,
    });
  } catch (error) {
    if (error.message === "PROPUESTA_YA_RESPONDIDA") {
      return res.status(409).json({ error: "La propuesta ya fue respondida." });
    }
    console.error("Error al responder propuesta de cambio:", error);
    return res
      .status(500)
      .json({ error: "No se pudo responder la propuesta." });
  }
};

/* ──────────────────────────────────────────────────────────────
   RF-110 · Historial de propuestas (RN-098: solo participantes)
   ────────────────────────────────────────────────────────────── */

export const obtenerHistorialCambios = async (req, res) => {
  try {
    const id_cita = idValido(req.params.id);
    if (!id_cita) {
      return res
        .status(400)
        .json({ error: "El identificador de la cita no es válido." });
    }

    const { cita, esCliente, esEmprendedora } = await cargarCitaConRol(
      id_cita,
      req.user.id,
    );
    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });
    if (!esCliente && !esEmprendedora) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para consultar este historial." });
    }

    const cambios = await prisma.citaCambio.findMany({
      where: { id_cita },
      orderBy: { fecha_creacion: "desc" },
      include: {
        proponente: { select: { id: true, nombre: true, rol: true } },
      },
    });

    return res.json(cambios);
  } catch (error) {
    console.error("Error al consultar historial de cambios:", error);
    return res
      .status(500)
      .json({ error: "No se pudo consultar el historial de propuestas." });
  }
};

/* ──────────────────────────────────────────────────────────────
   Mensajería asociada a la cita
   ────────────────────────────────────────────────────────────── */

const validarParticipante = async (req, res) => {
  const id_cita = idValido(req.params.id);
  if (!id_cita) {
    res.status(400).json({ error: "El identificador de la cita no es válido." });
    return null;
  }

  const { cita, esCliente, esEmprendedora } = await cargarCitaConRol(
    id_cita,
    req.user.id,
  );
  if (!cita) {
    res.status(404).json({ error: "Cita no encontrada." });
    return null;
  }
  if (!esCliente && !esEmprendedora) {
    res.status(403).json({ error: "No tienes permiso sobre esta conversación." });
    return null;
  }
  return id_cita;
};

export const obtenerMensajesCita = async (req, res) => {
  try {
    const id_cita = await validarParticipante(req, res);
    if (!id_cita) return;

    const mensajes = await prisma.citaMensaje.findMany({
      where: { id_cita },
      orderBy: { fecha: "asc" },
      take: 100,
      include: { remitente: { select: { id: true, rol: true } } },
    });

    return res.json(mensajes);
  } catch (error) {
    console.error("Error al consultar mensajes:", error);
    return res
      .status(500)
      .json({ error: "No se pudieron consultar los mensajes." });
  }
};

export const enviarMensajeCita = async (req, res) => {
  try {
    const { contenido } = req.body;
    if (
      typeof contenido !== "string" ||
      !contenido.trim() ||
      contenido.trim().length > 3000
    ) {
      return res
        .status(400)
        .json({ error: "El mensaje debe contener entre 1 y 3000 caracteres." });
    }

    const id_cita = await validarParticipante(req, res);
    if (!id_cita) return;

    const mensaje = await prisma.citaMensaje.create({
      data: { id_cita, id_remitente: req.user.id, contenido: contenido.trim() },
      include: { remitente: { select: { id: true, rol: true } } },
    });

    return res
      .status(201)
      .json({ message: "Mensaje enviado correctamente.", mensaje });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return res.status(500).json({ error: "No se pudo enviar el mensaje." });
  }
};

export const marcarMensajesLeidos = async (req, res) => {
  try {
    const id_cita = await validarParticipante(req, res);
    if (!id_cita) return;

    const resultado = await prisma.citaMensaje.updateMany({
      where: { id_cita, id_remitente: { not: req.user.id }, leido: false },
      data: { leido: true },
    });

    return res.json({
      message: "Mensajes marcados como leídos.",
      cantidad_actualizada: resultado.count,
    });
  } catch (error) {
    console.error("Error al marcar mensajes como leídos:", error);
    return res
      .status(500)
      .json({ error: "No se pudieron marcar los mensajes como leídos." });
  }
};