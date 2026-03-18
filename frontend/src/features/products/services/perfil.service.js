import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api/perfil'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const perfilService = {
  async obtener() {
    const res = await axios.get(BASE_URL, { headers: getHeaders() })
    return res.data
  },

  async actualizar(data) {
    const res = await axios.put(BASE_URL, data, { headers: getHeaders() })
    return res.data
  }
}