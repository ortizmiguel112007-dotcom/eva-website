import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE_URL = `${API_URL}/api/destacados`

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const destacadoService = {
  async listar() {
    const res = await axios.get(BASE_URL, { headers: getHeaders() })
    return res.data
  },

  async toggle(id) {
    const res = await axios.put(`${BASE_URL}/${id}`, {}, { headers: getHeaders() })
    return res.data
  }
}