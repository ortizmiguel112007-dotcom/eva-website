import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiFileText } from "react-icons/fi"
import { FacturaCard } from "@/features/products/components/facturas/FacturaCard"
import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = "http://localhost:3000"

export default function Facturas() {
  const { token } = useAuth()
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    axios.get(`${BASE}/api/emprendedora/facturas`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setFacturas(res.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [token])

  if (cargando) return <div className="pagos-loading">Cargando facturas...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Facturas de mis ventas</h1>
        <p>Comprobantes generados por las compras de tus clientes</p>
      </div>

      {facturas.length === 0 ? (
        <div className="pagos-empty">
          <FiFileText size={40} color="#cbd5e1" />
          <p>Aún no hay facturas para tus ventas</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {facturas.map(f => (
            <FacturaCard key={f.id_factura} factura={f} mostrarCliente />
          ))}
        </div>
      )}
    </div>
  )
}