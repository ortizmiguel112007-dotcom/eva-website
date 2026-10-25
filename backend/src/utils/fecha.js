const ZONA_HORARIA = "America/Bogota";

export const obtenerFechaColombia = (fecha) => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);

  const valores = Object.fromEntries(
    partes.map(({ type, value }) => [type, value]),
  );

  return {
    anio: Number(valores.year),
    mes: Number(valores.month),
    dia: Number(valores.day),
  };
};

export const obtenerHoraColombia = (fecha) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA_HORARIA,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(fecha);

export const obtenerDiaSemanaColombia = (fecha) => {
  const { anio, mes, dia } = obtenerFechaColombia(fecha);

  return new Date(
    Date.UTC(anio, mes - 1, dia),
  ).getUTCDay();
};