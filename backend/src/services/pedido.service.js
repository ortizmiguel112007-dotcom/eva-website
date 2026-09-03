import axios from 'axios'

// Usa la variable de entorno de Vite o un fallback a localhost para desarrollo
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE_URL = `${API_URL}/api/pedidos`

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const pedidoService = {
  async listar() {
    const res = await axios.get(BASE_URL, { headers: getHeaders() })
    return res.data
  },

  async obtener(id) {
    const res = await axios.get(`${BASE_URL}/${id}`, { headers: getHeaders() })
    return res.data
  },

  async cambiarEstado(id, estado) {
    const res = await axios.put(`${BASE_URL}/${id}/estado`, { estado }, { headers: getHeaders() })
    return res.data
  }
}