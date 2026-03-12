import axios from 'axios'

const BASE_URL = 'http://localhost:3000/admin'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const adminService = {
  async listarUsuarios() {
    const res = await axios.get(`${BASE_URL}/usuarios`, { headers: getHeaders() })
    return res.data
  },

  async toggleEstado(id) {
    const res = await axios.patch(`${BASE_URL}/usuarios/${id}/estado`, {}, { headers: getHeaders() })
    return res.data
  },

  async aprobarEmprendedora(id) {
    const res = await axios.put(`${BASE_URL}/usuarios/${id}/aprobar`, {}, { headers: getHeaders() })
    return res.data
  },

  async cambiarRol(id, rol) {
    const res = await axios.put(`${BASE_URL}/usuarios/${id}/rol`, { rol }, { headers: getHeaders() })
    return res.data
  },

  async listarAuditoria() {
    const res = await axios.get(`${BASE_URL}/auditoria`, { headers: getHeaders() })
    return res.data
  }
}