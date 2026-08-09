import axios from "axios"

const BASE = "http://localhost:3000/api"

export const perfilService = {
  async obtener(token) {
    const res = await axios.get(`${BASE}/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },

  async actualizar(data, token) {
    const res = await axios.put(`${BASE}/perfil`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },

  async obtenerDatosBancarios(token) {
    const res = await axios.get(`${BASE}/emprendedora/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },

  async actualizarDatosBancarios(datos_bancarios, token) {
    const res = await axios.put(`${BASE}/emprendedora/datos-bancarios`,
      { datos_bancarios },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return res.data
  }
}