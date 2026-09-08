import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE_URL = `${API_URL}/api/comentarios`

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const comentarioService = {
  async listar() {
    const res = await axios.get(BASE_URL, { headers: getHeaders() })
    return res.data
  },

  async crear(data) {
    const res = await axios.post(BASE_URL, data, { headers: getHeaders() })
    return res.data
  },

  async ocultar(id) {
    const res = await axios.put(`${BASE_URL}/${id}/ocultar`, {}, { headers: getHeaders() })
    return res.data
  }
}