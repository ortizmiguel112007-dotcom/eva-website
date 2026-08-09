import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiDollarSign } from "react-icons/fi"
import { LiquidacionCard } from "@/features/products/components/liquidaciones/LiquidacionCard"
import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = "http://localhost:3000"

export default function Liquidaciones() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [liquidaciones, setLiquidaciones] = useState([])
  const [cargando, setCargando]           = useState(true)
  const [filtro, setFiltro]               = useState("todos")

  useEffect(() => {
    axios.get(`${BASE}/api/emprendedora/liquidaciones`, { headers })
      .then(res => setLiquidaciones(res.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const filtradas = liquidaciones.filter(l => filtro === "todos" || l.estado === filtro)
  const totalPendiente = liquidaciones
    .filter(l => l.estado === "pendiente")
    .reduce((acc, l) => acc + Number(l.monto), 0)

  if (cargando) return <div className="pagos-loading">Cargando liquidaciones...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Mis liquidaciones</h1>
        <p>
          Total pendiente por recibir:{" "}
          <strong>${totalPendiente.toLocaleString("es-CO")}</strong>
        </p>
      </div>

      <div className="pagos-filtros">
        {["todos", "pendiente", "pagado"].map(f => (
          <button key={f}
            className={`pagos-filtro-btn ${filtro === f ? "active" : ""}`}
            onClick={() => setFiltro(f)}
          >
            {f === "todos" ? "Todas" : f === "pendiente" ? "Pendientes" : "Pagadas"}
            <span className="pagos-filtro-count">
              ({f === "todos" ? liquidaciones.length : liquidaciones.filter(l => l.estado === f).length})
            </span>
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="pagos-empty">
          <FiDollarSign size={40} color="#cbd5e1" />
          <p>No hay liquidaciones con este filtro</p>
        </div>
      ) : (
        <div className="pagos-lista">
          {filtradas.map(l => (
            <LiquidacionCard key={l.id_liquidacion} liquidacion={l} />
            // sin onMarcarPagado → el botón no aparece, solo lectura (RF-072)
          ))}
        </div>
      )}
    </div>
  )
}