// shared/services/catalogo.service.js
import axios from "axios";

const BASE = "http://localhost:3000/api/publico";
const ITEMS = "http://localhost:3000/api/items";

export const catalogoService = {
  async getCatalogo(params = {}) {
    const res = await axios.get(`${BASE}/productos`, { params });
    return res.data;
  },
  async getDestacados() {
    const res = await axios.get(`${BASE}/destacados`);
    return res.data;
  },
  async getTiendas() {
    const res = await axios.get(`${BASE}/tiendas`);
    return res.data;
  },
  async getAlianzas() {
    const res = await axios.get(`${BASE}/alianzas`);
    return res.data;
  },
  async getProducto(id) {
    const res = await axios.get(`${ITEMS}/${id}`);
    return res.data;
  },
  async getComentariosProducto(id) {
    const res = await axios.get(
      `http://localhost:3000/api/comentarios/producto/${id}`
    );
    return res.data;
  },
  async obtenerProductosTienda(id_emprendedora) {
    const res = await axios.get(`${ITEMS}/tienda/${id_emprendedora}`);
    return res.data;
  },
};