import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api/alianzas'

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const alianzaService = {
  async listar() {
    const res = await axios.get(BASE_URL, { headers: getHeaders() })
    return res.data
  },

  async listarEmprendedoras() {
    const res = await axios.get(`${BASE_URL}/emprendedoras`, { headers: getHeaders() })
    return res.data
  },

  async crear(data) {
    const res = await axios.post(BASE_URL, data, { headers: getHeaders() })
    return res.data
  },

  async autorizar(id) {
    const res = await axios.put(`${BASE_URL}/${id}/autorizar`, {}, { headers: getHeaders() })
    return res.data
  },

  async finalizar(id) {
    const res = await axios.put(`${BASE_URL}/${id}/finalizar`, {}, { headers: getHeaders() })
    return res.data
  }
}