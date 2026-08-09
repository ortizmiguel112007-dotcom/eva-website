// tienda/components/tiendas/AlianzaHero.jsx
import { FiArrowLeft, FiUsers, FiCalendar } from "react-icons/fi"
import { getAvatarGradient, getInitials } from "@/features/tienda/utils/avatar"
import { formatFecha } from "@/features/tienda/utils/utils"

import "@/infrastructure/css/tienda/tiendas-perfil/TiendaAlianza.css"

export function AlianzaHero({ alianza, onVolver }) {
  const participantes = alianza.participantes || []

  return (
    <div className="ta-hero">
      <div className="ta-hero-blob ta-blob-1" />
      <div className="ta-hero-blob ta-blob-2" />

      <button className="ta-btn-volver" onClick={onVolver}>
        <FiArrowLeft size={14} /> Volver
      </button>

      <div className="ta-hero-content">
        <div className="ta-badge-alianza">
          <FiUsers size={12} /> Tienda Colaborativa
        </div>

        <h1 className="ta-hero-nombre">{alianza.nombre}</h1>
        {alianza.descripcion && <p className="ta-hero-desc">{alianza.descripcion}</p>}

        <div className="ta-participantes">
          {participantes.map(p => {
            const [c1, c2] = getAvatarGradient(p.usuario?.nombre)
            return (
              <div key={p.id} className="ta-participante">
                <div className="ta-participante-avatar"
                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  {getInitials(p.usuario?.nombre)}
                </div>
                <div>
                  <p className="ta-participante-nombre">{p.usuario?.nombre}</p>
                  <span className="ta-participante-sub">Emprendedora EVA</span>
                </div>
              </div>
            )
          })}
          {alianza.fecha_fin && (
            <div className="ta-fecha-fin">
              <FiCalendar size={12} /> Campaña hasta: {formatFecha(alianza.fecha_fin)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}