import { FiCalendar, FiUserCheck, FiFlag, FiUsers } from "react-icons/fi"
import { formatFecha } from "@/features/tienda/utils/utils"
import { getAvatarGradient, getInitials } from "@/features/tienda/utils/avatar"
import "@/infrastructure/css/products-emprend/alianzas/AlianzaCard.css"

export function AlianzaCard({ alianza, userId, onAutorizar, onFinalizar, onVerTienda }) {
  const miParticipacion = alianza.participantes.find(p => p.id_usuario === userId)
  const puedoAutorizar  = miParticipacion && !miParticipacion.autorizado
  const puedoFinalizar  = alianza.creada_por === userId && alianza.estado !== "finalizada"
  const esActiva        = alianza.estado === "activa"

  return (
    <div className={`alianza-card ${alianza.estado}`}>
      <div className="alianza-card-header">
        <div>
          <h3 className="alianza-nombre">{alianza.nombre}</h3>
          {alianza.descripcion && (
            <p className="alianza-descripcion">{alianza.descripcion}</p>
          )}
        </div>
        <span className={`alianza-badge ${alianza.estado}`}>
          {alianza.estado === "pendiente" ? "Pendiente"
           : alianza.estado === "activa"  ? "Activa" : "Finalizada"}
        </span>
      </div>

      <div className="alianza-participantes">
        <span className="alianza-participantes-title">
          Participantes ({alianza.participantes.length})
        </span>
        {alianza.participantes.map(p => {
          const [c1, c2] = getAvatarGradient(p.usuario.nombre)
          return (
            <div key={p.id_usuario} className="alianza-participante">
              <div className="alianza-participante-left">
                <div className="alianza-avatar"
                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  {getInitials(p.usuario.nombre)}
                </div>
                <span className="alianza-participante-nombre">{p.usuario.nombre}</span>
              </div>
              <span className={`alianza-participante-estado ${p.autorizado ? "ok" : "pendiente"}`}>
                {p.autorizado ? "✓ Autorizado" : "⏳ Pendiente"}
              </span>
            </div>
          )
        })}
      </div>

      <div className="alianza-fechas">
        <div className="alianza-fecha-item">
          <FiCalendar size={12} />
          <span>Inicio: {formatFecha(alianza.fecha_inicio)}</span>
        </div>
        {alianza.fecha_fin && (
          <div className="alianza-fecha-item">
            <FiCalendar size={12} />
            <span>Fin: {formatFecha(alianza.fecha_fin)}</span>
          </div>
        )}
      </div>

      <div className="alianza-card-actions">
        {puedoAutorizar && (
          <button className="btn-autorizar" onClick={() => onAutorizar(alianza.id_alianza)}>
            <FiUserCheck size={13} /> Autorizar participación
          </button>
        )}
        {puedoFinalizar && (
          <button className="btn-finalizar" onClick={() => onFinalizar(alianza.id_alianza)}>
            <FiFlag size={13} /> Finalizar
          </button>
        )}
        {esActiva && (
          <button className="btn-ver-tienda-conjunta" onClick={() => onVerTienda(alianza.id_alianza)}>
            <FiUsers size={13} /> Ver tienda conjunta
          </button>
        )}
      </div>
    </div>
  )
}