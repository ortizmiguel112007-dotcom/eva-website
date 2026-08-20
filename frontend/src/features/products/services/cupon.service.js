import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api/cupones'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const cuponService = {
  async listar() {
    const res = await axios.get(BASE_URL, { headers: getHeaders() })
    return res.data
  },

  async crear(data) {
    const res = await axios.post(BASE_URL, data, { headers: getHeaders() })
    return res.data
  },

  async toggle(id) {
    const res = await axios.put(`${BASE_URL}/${id}/toggle`, {}, { headers: getHeaders() })
    return res.data
  },

  async eliminar(id) {
    const res = await axios.delete(`${BASE_URL}/${id}`, { headers: getHeaders() })
    return res.data
  },

  async validar(codigo) {
    const res = await axios.post(`${BASE_URL}/validar`, { codigo }, { headers: getHeaders() })
    return res.data
  },

  // RF-098: métricas e historial de uso de un cupón propio
  async metricas(id) {
    const res = await axios.get(`${BASE_URL}/${id}/metricas`, { headers: getHeaders() })
    return res.data
  },
}