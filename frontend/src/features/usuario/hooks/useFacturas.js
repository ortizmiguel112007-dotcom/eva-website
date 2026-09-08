import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useFacturas(token) {
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/api/cliente/facturas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setFacturas(res.data))
      .catch(() => setFacturas([]))
      .finally(() => setCargando(false))
  }, [token])

  // El PDF ya existe como archivo real (generado en el backend, alojado en Cloudinary)
  const handleDescargar = (factura) => {
    window.open(factura.url_pdf, "_blank")
  }

  const totalGastado = facturas.reduce((acc, f) => acc + Number(f.pedido?.total || 0), 0)

  return { facturas, cargando, totalGastado, handleDescargar }
}