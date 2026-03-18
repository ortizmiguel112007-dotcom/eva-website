import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api/pedidos'

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