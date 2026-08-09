import { useState, useEffect } from "react"
import axios from "axios"

export function useFacturas(token) {
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    axios.get("http://localhost:3000/api/cliente/facturas", {
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