import axios from 'axios'

const BASE = 'http://localhost:3000/api/publico'

export const catalogoService = {
  async getDestacados() {
    const res = await axios.get(`${BASE}/destacados`)
    return res.data
  },
  async getCatalogo(params = {}) {
    const res = await axios.get(`${BASE}/productos`, { params })
    return res.data
  },
  async getTiendas() {
    const res = await axios.get(`${BASE}/tiendas`)
    return res.data
  }
}