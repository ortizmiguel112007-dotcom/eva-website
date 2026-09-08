import { useState, useEffect } from "react"
import axios from "axios"
import { FiClock, FiUser } from "react-icons/fi"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

const EVENTO_LABEL = {
  solicitado: "Solicitud enviada",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  desactivado: "Desactivado",
}
const EVENTO_COLOR = {
  solicitado: "#64748b", aprobado: "#16a34a", rechazado: "#ef4444", desactivado: "#f59e0b",
}

export function HistorialDestacado({ id_producto, token }) {
  const [logs, setLogs] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!id_producto) return
    axios.get(`${BASE}/api/admin/destacados/${id_producto}/historial`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setLogs(res.data))
      .catch(() => setLogs([]))
      .finally(() => setCargando(false))
  }, [id_producto, token])

  const formatFechaHora = (f) =>
    new Date(f).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })

  if (cargando) return <p className="historial-cargando">Cargando historial...</p>
  if (logs.length === 0) return <p className="historial-vacio">Sin eventos registrados</p>

  return (
    <div className="historial-timeline">
      {logs.map((log) => (
        <div key={log.id_log} className="historial-item">
          <span className="historial-punto" style={{ background: EVENTO_COLOR[log.evento] || "#94a3b8" }} />
          <div className="historial-contenido">
            <div className="historial-header-row">
              <strong style={{ color: EVENTO_COLOR[log.evento] }}>{EVENTO_LABEL[log.evento] || log.evento}</strong>
              <span className="historial-fecha"><FiClock size={11} /> {formatFechaHora(log.fecha)}</span>
            </div>
            {log.usuario && (
              <p className="historial-usuario"><FiUser size={11} /> {log.usuario.nombre} ({log.usuario.rol})</p>
            )}
            {log.detalle && <p className="historial-detalle">{log.detalle}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}