import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/core/context/AuthConten"
import { FiDollarSign } from "react-icons/fi"
import { LiquidacionCard } from "@/features/products/components/liquidaciones/LiquidacionCard"
import "@/infrastructure/css/products-emprend/pagos/Pagos.css"

const BASE = "http://localhost:3000"

export default function AdminLiquidaciones() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [liquidaciones, setLiquidaciones] = useState([])
  const [cargando, setCargando]           = useState(true)
  const [filtro, setFiltro]               = useState("pendiente")
  const [toast, setToast]                 = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await axios.get(`${BASE}/api/admin/liquidaciones`, { headers })
      setLiquidaciones(res.data)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleMarcarPagado = async (liquidacion) => {
    if (!window.confirm(`¿Confirmas que ya le transferiste ${liquidacion.monto ? "" : ""}$${Number(liquidacion.monto).toLocaleString("es-CO")} a ${liquidacion.emprendedora?.usuario?.nombre}?`))
      return
    try {
      await axios.put(`${BASE}/api/admin/liquidaciones/${liquidacion.id_liquidacion}/pagar`, {}, { headers })
      mostrarToast("Liquidación marcada como pagada")
      cargar()
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al actualizar", "error")
    }
  }

  const filtradas = liquidaciones.filter(l => filtro === "todos" || l.estado === filtro)
  const totalPendiente = liquidaciones
    .filter(l => l.estado === "pendiente")
    .reduce((acc, l) => acc + Number(l.monto), 0)

  if (cargando) return <div className="pagos-loading">Cargando liquidaciones...</div>

  return (
    <div className="pagos-page">
      <div className="pagos-header">
        <h1>Liquidaciones a emprendedoras</h1>
        <p>
          Total pendiente por pagar:{" "}
          <strong>${totalPendiente.toLocaleString("es-CO")}</strong>
        </p>
      </div>

      <div className="pagos-filtros">
        {["pendiente", "pagado", "todos"].map(f => (
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
            <LiquidacionCard key={l.id_liquidacion} liquidacion={l} onMarcarPagado={handleMarcarPagado} />
          ))}
        </div>
      )}

      {toast && <div className={`pagos-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  )
}