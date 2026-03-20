import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api/items'

export const tiendaService = {
  async obtenerProductos(id_emprendedora) {
    const res = await axios.get(`${BASE_URL}/tienda/${id_emprendedora}`)
    return res.data
  }
}