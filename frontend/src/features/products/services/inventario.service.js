import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api/inventario'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const inventarioService = {
  async listar() {
    const res = await axios.get(BASE_URL, { headers: getHeaders() })
    return res.data
  },

  async actualizarStock(id, data) {
    const res = await axios.put(`${BASE_URL}/${id}`, data, { headers: getHeaders() })
    return res.data
  }
}