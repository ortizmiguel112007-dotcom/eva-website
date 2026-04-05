import axios from "axios";

const BASE_URL = "http://localhost:3000/api/perfil";

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
      "http://localhost:3000/api/emprendedora/datos-bancarios",
      { datos_bancarios },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
    );
    return res.data;
  },

  async obtenerEmprendedora() {
  const res = await axios.get(
    "http://localhost:3000/api/emprendedora/mi-perfil",
    { headers: getHeaders() }
  )
  return res.data
},
};
