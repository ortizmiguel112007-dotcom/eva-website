import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const BASE_URL = `${API_URL}/api/agenda`;

const configAuth = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

export const agendaService = {
  // ── Disponibilidad de la emprendedora ───────────────────────
  async obtenerMiDisponibilidad() {
    const res = await axios.get(`${BASE_URL}/mia`, configAuth());
    return res.data;
  },

  async obtenerDisponibilidadPublica(idEmprendedora) {
    const res = await axios.get(`${BASE_URL}/emprendedora/${idEmprendedora}`);
    return res.data;
  },

  // Horas libres de un servicio en una fecha (RF-104)
  async obtenerHorariosDisponibles({ id_producto, fecha, modalidad }) {
    const res = await axios.get(`${BASE_URL}/horarios`, {
      params: { id_producto, fecha, ...(modalidad ? { modalidad } : {}) },
    });
    return res.data;
  },

  async crearDisponibilidad(data) {
    const res = await axios.post(BASE_URL, data, configAuth());
    return res.data;
  },

  async actualizarDisponibilidad(idDisponibilidad, data) {
    const res = await axios.patch(
      `${BASE_URL}/${idDisponibilidad}`,
      data,
      configAuth(),
    );
    return res.data;
  },

  async desactivarDisponibilidad(idDisponibilidad) {
    const res = await axios.delete(
      `${BASE_URL}/${idDisponibilidad}`,
      configAuth(),
    );
    return res.data;
  },

  // ── Citas del cliente ───────────────────────────────────────
  async crearCita(data) {
    const res = await axios.post(`${BASE_URL}/citas`, data, configAuth());
    return res.data;
  },

  async obtenerMisCitas() {
    const res = await axios.get(`${BASE_URL}/citas/mias`, configAuth());
    return res.data;
  },

  // ── Citas recibidas por la emprendedora ─────────────────────
  async obtenerCitasRecibidas() {
    const res = await axios.get(`${BASE_URL}/citas/recibidas`, configAuth());
    return res.data;
  },

  async responderCita(idCita, estado, motivoRechazo = "") {
    const data = { estado };

    if (estado === "RECHAZADA" && motivoRechazo.trim()) {
      data.motivo_rechazo = motivoRechazo.trim();
    }

    const res = await axios.patch(
      `${BASE_URL}/citas/${idCita}/estado`,
      data,
      configAuth(),
    );

    return res.data;
  },

  async cancelarCita(idCita, motivo = "") {
    const res = await axios.patch(
      `${BASE_URL}/citas/${idCita}/cancelar`,
      motivo.trim() ? { motivo: motivo.trim() } : {},
      configAuth(),
    );
    return res.data;
  },

  // ── Reprogramaciones de citas ───────────────────────────────
  async obtenerHistorialCambios(idCita) {
    const res = await axios.get(
      `${BASE_URL}/citas/${idCita}/cambios`,
      configAuth(),
    );
    return res.data;
  },

  async proponerCambioCita(idCita, data) {
    const res = await axios.post(
      `${BASE_URL}/citas/${idCita}/cambios`,
      data,
      configAuth(),
    );

    return res.data;
  },

  async responderCambioCita(idCita, idCambio, estado, respuesta = "") {
    const data = { estado };

    if (respuesta.trim()) {
      data.respuesta = respuesta.trim();
    }

    const res = await axios.patch(
      `${BASE_URL}/citas/${idCita}/cambios/${idCambio}/respuesta`,
      data,
      configAuth(),
    );

    return res.data;
  },

  // ── Mensajería asociada a una cita ──────────────────────────
  async obtenerMensajesCita(idCita) {
    const res = await axios.get(
      `${BASE_URL}/citas/${idCita}/mensajes`,
      configAuth(),
    );

    return res.data;
  },

  async enviarMensajeCita(idCita, contenido) {
    const res = await axios.post(
      `${BASE_URL}/citas/${idCita}/mensajes`,
      { contenido },
      configAuth(),
    );

    return res.data;
  },

  async marcarMensajesLeidos(idCita) {
    const res = await axios.patch(
      `${BASE_URL}/citas/${idCita}/mensajes/leidos`,
      {},
      configAuth(),
    );

    return res.data;
  },
};