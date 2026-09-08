import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE_URL = `${API_URL}/api/inventario`

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
  },
  
  async listarHistorial(id_producto) {
  const res = await axios.get(
    `${API_URL}/api/movimientos/${id_producto}`,
    { headers: getHeaders() }
  )
  return res.data
}
}
