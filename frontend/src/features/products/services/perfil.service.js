import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE_URL = `${API_URL}/api/perfil`;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const perfilService = {
  async obtener() {
    const res = await axios.get(BASE_URL, { headers: getHeaders() });
    return res.data;
  },

  async actualizar(data) {
    const res = await axios.put(BASE_URL, data, { headers: getHeaders() });
    return res.data;
  },

  async actualizarDatosBancarios(datos_bancarios) {
    const res = await axios.put(
      `${API_URL}/api/emprendedora/datos-bancarios`,
      { datos_bancarios },
      { headers: getHeaders() },
    );
    return res.data;
  },

  async obtenerEmprendedora() {
  const res = await axios.get(
    `${API_URL}/api/emprendedora/mi-perfil`,
    { headers: getHeaders() }
  )
  return res.data
},
};
