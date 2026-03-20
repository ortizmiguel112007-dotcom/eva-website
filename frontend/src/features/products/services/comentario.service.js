import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api/comentarios'

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