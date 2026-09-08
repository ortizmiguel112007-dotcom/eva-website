import { useState, useEffect } from "react"
import axios from "axios"
import { FiClock, FiUser } from "react-icons/fi"
import "@/infrastructure/css/products-emprend/pagos/HistorialPago.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

const EVENTO_LABEL = {
  creado:               "Pago creado",
  comprobante_subido:   "Comprobante subido",
  error_subida:         "Error al subir comprobante",
  aprobado:             "Pago aprobado",
  rechazado:            "Pago rechazado",
  error_verificacion:   "Error al verificar",
}

const EVENTO_COLOR = {
  creado:             "#64748b",
  comprobante_subido: "#2563eb",
  error_subida:       "#ef4444",
  aprobado:           "#16a34a",
  rechazado:          "#ef4444",
  error_verificacion: "#ef4444",
}

export function HistorialPago({ id_pago, token }) {
  const [logs, setLogs]         = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!id_pago) return
    setCargando(true)
    axios.get(`${BASE}/api/admin/pagos/${id_pago}/historial`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setLogs(res.data))
      .catch(() => setLogs([]))
      .finally(() => setCargando(false))
  }, [id_pago, token])

  const formatFechaHora = (f) =>
    new Date(f).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })

  if (cargando) return <p className="historial-cargando">Cargando historial...</p>
  if (logs.length === 0) return <p className="historial-vacio">Sin eventos registrados</p>

  return (
    <div className="historial-timeline">
      {logs.map(log => (
        <div key={log.id_log} className="historial-item">
          <span className="historial-punto" style={{ background: EVENTO_COLOR[log.evento] || "#94a3b8" }} />
          <div className="historial-contenido">
            <div className="historial-header-row">
              <strong style={{ color: EVENTO_COLOR[log.evento] || "#1e293b" }}>
                {EVENTO_LABEL[log.evento] || log.evento}
              </strong>
              <span className="historial-fecha">
                <FiClock size={11} /> {formatFechaHora(log.fecha)}
              </span>
            </div>
            {log.usuario && (
              <p className="historial-usuario">
                <FiUser size={11} /> {log.usuario.nombre} ({log.usuario.rol})
              </p>
            )}
            {log.detalle && <p className="historial-detalle">{log.detalle}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}