import axios from "axios";
const BASE_URL = "http://localhost:3000/api/items";
const PUBLICO_URL = "http://localhost:3000/api/publico";

export const tiendaService = {
  async getProducto(id) {
    const res = await axios.get(`http://localhost:3000/api/items/${id}`);
    return res.data;
  },
  async getComentariosProducto(id) {
    const res = await axios.get(
      `http://localhost:3000/api/comentarios/producto/${id}`,
    );
    return res.data;
  },
  async obtenerProductos(id_emprendedora) {
    const res = await axios.get(`${BASE_URL}/tienda/${id_emprendedora}`);
    return res.data;
  },

  async getDestacados() {
    const res = await axios.get(`${PUBLICO_URL}/destacados`);
    return res.data;
  },
  async getCatalogo(params = {}) {
    const res = await axios.get(`${PUBLICO_URL}/productos`, { params });
    return res.data;
  },
  async getTiendas() {
    const res = await axios.get(`${PUBLICO_URL}/tiendas`);
    return res.data;
  },
  async getAlianzas() {
    const res = await axios.get(`${PUBLICO_URL}/alianzas`);
    return res.data;
  },
};
