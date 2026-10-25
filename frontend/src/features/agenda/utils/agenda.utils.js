export const ZONA_HORARIA = "America/Bogota";

export const ETIQUETA_ESTADO = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
  ACEPTADA: "Aceptada",
};

export const ETIQUETA_MODALIDAD = {
  virtual: "Virtual",
  presencial: "Presencial",
  domicilio: "A domicilio",
};

export const DESCRIPCION_MODALIDAD = {
  virtual: "Videollamada o chat",
  presencial: "En el lugar de la emprendedora",
  domicilio: "Ella va hasta tu dirección",
};

// Lunes primero, igual que en un calendario colombiano.
export const DIAS_SEMANA = [
  { valor: 1, nombre: "Lunes", corto: "Lun" },
  { valor: 2, nombre: "Martes", corto: "Mar" },
  { valor: 3, nombre: "Miércoles", corto: "Mié" },
  { valor: 4, nombre: "Jueves", corto: "Jue" },
  { valor: 5, nombre: "Viernes", corto: "Vie" },
  { valor: 6, nombre: "Sábado", corto: "Sáb" },
  { valor: 0, nombre: "Domingo", corto: "Dom" },
];

export const nombreDia = (valor) =>
  DIAS_SEMANA.find((d) => d.valor === Number(valor))?.nombre ?? `Día ${valor}`;

const fmt = (fecha, opciones) => {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONA_HORARIA,
    ...opciones,
  }).format(d);
};

export const formatearFechaHora = (fecha) =>
  fecha
    ? fmt(fecha, { dateStyle: "medium", timeStyle: "short" }) ||
      "Fecha no válida"
    : "Fecha no disponible";

export const formatearHora = (fecha) =>
  fmt(fecha, { hour: "numeric", minute: "2-digit", hour12: true });

export const partesFecha = (fecha) => ({
  dia: fmt(fecha, { day: "2-digit" }),
  mes: fmt(fecha, { month: "short" }).replace(".", ""),
  diaSemana: fmt(fecha, { weekday: "short" }).replace(".", ""),
});

export const formatearRangoHora = (inicio, fin) =>
  `${formatearHora(inicio)} – ${formatearHora(fin)}`;

export const formatearPrecio = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);

export const formatearDuracion = (minutos) => {
  const m = Number(minutos);
  if (!m) return "No especificada";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto ? `${h} h ${resto} min` : `${h} h`;
};

export const iniciales = (nombre = "") =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

export const esFutura = (fecha) => new Date(fecha) > new Date();

export const cortarHora = (hora) => String(hora ?? "").slice(0, 5);

// "YYYY-MM-DD" del día actual en Colombia, sin depender de la zona del navegador.
const hoyColombia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // en-CA => YYYY-MM-DD

export const diaSemanaDeFecha = (fechaISO) => {
  const [a, m, d] = fechaISO.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
};

// Próximos N días a partir de hoy (hora de Colombia).
export const diasProximos = (cantidad = 21) => {
  const [a, m, d] = hoyColombia().split("-").map(Number);
  const nombres = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const meses = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];

  return Array.from({ length: cantidad }, (_, i) => {
    const f = new Date(Date.UTC(a, m - 1, d + i));
    const iso = f.toISOString().slice(0, 10);
    return {
      fecha: iso,
      diaSemana: f.getUTCDay(),
      nombre: i === 0 ? "Hoy" : nombres[f.getUTCDay()],
      numero: f.getUTCDate(),
      mes: meses[f.getUTCMonth()],
    };
  });
};

export const obtenerError = (err, porDefecto) =>
  err?.response?.data?.error ||
  err?.response?.data?.mensaje ||
  err?.response?.data?.message ||
  porDefecto;

// Filtros compartidos por las vistas de cliente y emprendedora.
export const tieneCambioPendiente = (cita) =>
  Array.isArray(cita.cambios) &&
  cita.cambios.some((c) => c.estado === "PENDIENTE");

export const esHistorial = (cita) =>
  ["RECHAZADA", "CANCELADA"].includes(cita.estado) ||
  (cita.estado === "CONFIRMADA" && !esFutura(cita.fecha_fin));