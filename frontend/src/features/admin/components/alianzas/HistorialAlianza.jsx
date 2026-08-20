import { useState, useEffect } from "react"
import axios from "axios"
import { FiClock, FiUser } from "react-icons/fi"

const BASE = "http://localhost:3000"

const EVENTO_LABEL = {
  creada: "Alianza creada",
  autorizada: "Participante autorizó",
  pendiente_aprobacion: "Autorización mutua completa",
  aprobada: "Aprobada por admin",
  rechazada: "Rechazada por admin",
  desactivada: "Desactivada por admin",
  finalizada: "Finalizada por creador",
  vencida: "Finalizada automáticamente (venció)",
}
const EVENTO_COLOR = {
  creada: "#64748b", autorizada: "#2563eb", pendiente_aprobacion: "#7c3aed",
  aprobada: "#16a34a", rechazada: "#ef4444", desactivada: "#ef4444",
  finalizada: "#94a3b8", vencida: "#94a3b8",
}

export function HistorialAlianza({ id_alianza, token }) {
  const [logs, setLogs] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!id_alianza) return
    axios.get(`${BASE}/api/admin/alianzas/${id_alianza}/historial`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setLogs(res.data))
      .catch(() => setLogs([]))
      .finally(() => setCargando(false))
  }, [id_alianza, token])

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