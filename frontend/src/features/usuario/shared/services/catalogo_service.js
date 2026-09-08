// shared/services/catalogo.service.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE = `${API_URL}/api/publico`;
const ITEMS = `${API_URL}/api/items`;

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
      `${API_URL}/api/comentarios/producto/${id}`
    );
    return res.data;
  },
  async obtenerProductosTienda(id_emprendedora) {
    const res = await axios.get(`${ITEMS}/tienda/${id_emprendedora}`);
    return res.data;
  },
};