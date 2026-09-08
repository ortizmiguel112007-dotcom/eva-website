import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BASE_URL = `${API_URL}/api/items`

export const itemService = {

  async crear(data) {
    const res = await axios.post(BASE_URL, data)
    return res.data
  },

  async obtenerPorSeccion(id_seccion, categoria) {
    const res = await axios.get(`${BASE_URL}/seccion/${id_seccion}`, {
      params: { categoria },
    })
    return res.data
  },

  async obtenerPorId(id) {
    const res = await axios.get(`${BASE_URL}/${id}`)
    return res.data
  },

 async actualizar(id, data) {
  const token = localStorage.getItem("token")
  const res = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.data
},

async toggleVisible(id) {
  const token = localStorage.getItem("token")
  const res = await axios.patch(`${BASE_URL}/${id}/visible`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.data
},

 async eliminar(id) {
  const token = localStorage.getItem("token")

  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return res.data
}
}