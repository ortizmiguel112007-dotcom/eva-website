import { FiUsers, FiClock, FiCheck, FiX, FiTrash2, FiClipboard, FiBarChart2 } from "react-icons/fi"
import "@/infrastructure/css/products-emprend/alianzas/AlianzaCard.css"

const ESTADO_INFO = {
  pendiente:            { label: "Esperando autorización", color: "#f59e0b", bg: "#fffbeb" },
  pendiente_aprobacion: { label: "Esperando aprobación admin", color: "#7c3aed", bg: "#f5f3ff" },
  activa:               { label: "Activa", color: "#16a34a", bg: "#f0fdf4" },
  rechazada:            { label: "Rechazada", color: "#ef4444", bg: "#fef2f2" },
  desactivada:          { label: "Desactivada", color: "#ef4444", bg: "#fef2f2" },
  finalizada:           { label: "Finalizada", color: "#64748b", bg: "#f8fafc" },
}

export function AlianzaCard({
  alianza,
  usuarioActualId,
  contexto = "emprendedora", // "emprendedora" | "admin"
  onAutorizar,
  onFinalizar,
  onAprobar,
  onRechazar,
  onDesactivar,
  onVerHistorial,
  onVerMetricas,
}) {
  const estado = ESTADO_INFO[alianza.estado] || { label: alianza.estado, color: "#64748b", bg: "#f8fafc" }
  const miParticipacion = alianza.participantes?.find(p => p.id_usuario === usuarioActualId)
  const esCreador = alianza.creada_por === usuarioActualId
  const yaAutorice = miParticipacion?.autorizado

  return (
    <div className="ac-card">
      <div className="ac-card-header">
        <div>
          <div className="ac-card-titulo-row">
            <FiUsers size={15} color="#7c3aed" />
            <strong>{alianza.nombre}</strong>
          </div>
          {alianza.descripcion && <p className="ac-card-desc">{alianza.descripcion}</p>}
        </div>
        <span className="ac-badge" style={{ color: estado.color, background: estado.bg }}>
          {estado.label}
        </span>
      </div>

      <div className="ac-card-participantes">
        {alianza.participantes?.map(p => (
          <span key={p.id_usuario} className={`ac-participante ${p.autorizado ? "ac-participante--ok" : ""}`}>
            {p.usuario?.nombre} {p.autorizado ? <FiCheck size={11} /> : <FiClock size={11} />}
          </span>
        ))}
      </div>

      <div className="ac-card-acciones">
        {contexto === "emprendedora" && alianza.estado === "pendiente" && !yaAutorice && (
          <button className="ac-btn ac-btn--ok" onClick={() => onAutorizar(alianza)}>
            <FiCheck size={13} /> Autorizar participación
          </button>
        )}
        {contexto === "emprendedora" && alianza.estado === "activa" && esCreador && (
          <button className="ac-btn ac-btn--danger" onClick={() => onFinalizar(alianza)}>
            <FiTrash2 size={13} /> Finalizar alianza
          </button>
        )}
        {contexto === "emprendedora" && alianza.estado === "activa" && (
          <button className="ac-btn ac-btn--ghost" onClick={() => onVerMetricas(alianza)}>
            <FiBarChart2 size={13} /> Ver métricas
          </button>
        )}

        {contexto === "admin" && alianza.estado === "pendiente_aprobacion" && (
          <>
            <button className="ac-btn ac-btn--ok" onClick={() => onAprobar(alianza)}>
              <FiCheck size={13} /> Aprobar
            </button>
            <button className="ac-btn ac-btn--danger" onClick={() => onRechazar(alianza)}>
              <FiX size={13} /> Rechazar
            </button>
          </>
        )}
        {contexto === "admin" && alianza.estado === "activa" && (
          <button className="ac-btn ac-btn--danger" onClick={() => onDesactivar(alianza)}>
            <FiTrash2 size={13} /> Desactivar
          </button>
        )}
        {contexto === "admin" && (
          <button className="ac-btn ac-btn--ghost" onClick={() => onVerHistorial(alianza)}>
            <FiClipboard size={13} /> Historial
          </button>
        )}
      </div>
    </div>
  )
}