import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api/destacados'

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