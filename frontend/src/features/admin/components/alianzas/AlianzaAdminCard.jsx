import {
  FiUsers, FiCalendar, FiPackage,
  FiChevronDown, FiChevronUp, FiCheck, FiClock, FiFlag
} from "react-icons/fi"
import { getInitials, getAvatarGradient } from "@/features/tienda/utils/avatar"
import { formatFecha, formatPrecio } from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/alianzas/AlianzaAdminCard.css"

const ESTADO_CONFIG = {
  activa:     { cls: "aa-badge--activa",     label: "Activa",     icon: <FiCheck size={10} /> },
  pendiente:  { cls: "aa-badge--pendiente",  label: "Pendiente",  icon: <FiClock size={10} /> },
  finalizada: { cls: "aa-badge--finalizada", label: "Finalizada", icon: <FiFlag  size={10} /> },
}

function Avatar({ nombre }) {
  const [c1, c2] = getAvatarGradient(nombre)
  return (
    <div className="aa-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
      {getInitials(nombre)}
    </div>
  )
}

export function AlianzaAdminCard({ alianza: a, expandido, onToggle }) {
  const est   = ESTADO_CONFIG[a.estado] || ESTADO_CONFIG.pendiente
  const isExp = expandido === a.id_alianza
  const todosAutorizados = a.participantes?.every(p => p.autorizado)

  return (
    <div className="aa-card">
      <div className="aa-card-row" onClick={() => onToggle(a.id_alianza)}>
        <div className="aa-card-left">
          <div className="aa-card-titulo">
            <span className="aa-card-nombre">{a.nombre}</span>
            <span className={`aa-badge ${est.cls}`}>{est.icon} {est.label}</span>
            {!todosAutorizados && (
              <span className="aa-badge aa-badge--pendiente-auth">
                <FiClock size={10} /> Esperando autorización
              </span>
            )}
          </div>
          <div className="aa-card-meta">
            <span><FiUsers    size={11} /> {a.participantes?.length || 0} participantes</span>
            <span><FiCalendar size={11} /> Creada: {formatFecha(a.fecha_inicio)}</span>
            <span><FiCalendar size={11} /> Fin: {formatFecha(a.fecha_fin) || "Sin fecha límite"}</span>
          </div>
          {a.descripcion && <p className="aa-card-desc">{a.descripcion}</p>}
        </div>

        <div className="aa-avatares">
          {a.participantes?.map(p => (
            <div key={p.id} className="aa-avatar-wrap" title={p.usuario?.nombre}>
              <Avatar nombre={p.usuario?.nombre} />
              {p.autorizado && <div className="aa-avatar-check"><FiCheck size={8} /></div>}
            </div>
          ))}
        </div>

        <div className="aa-chevron">
          {isExp ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </div>
      </div>

      {isExp && (
        <div className="aa-detalle">
          {a.participantes?.map(p => {
            const productos = p.usuario?.emprendedora?.secciones?.flatMap(s => s.productos) || []
            return (
              <div key={p.id} className="aa-participante">
                <div className="aa-participante-header">
                  <Avatar nombre={p.usuario?.nombre} />
                  <div>
                    <p className="aa-participante-nombre">{p.usuario?.nombre}</p>
                    <span className="aa-participante-email">{p.usuario?.email}</span>
                  </div>
                  <span className={`aa-auth-badge ${p.autorizado ? "autorizado" : "pendiente"}`}>
                    {p.autorizado
                      ? <><FiCheck size={10} /> Autorizado</>
                      : <><FiClock size={10} /> Pendiente</>
                    }
                  </span>
                </div>

                {productos.length > 0 ? (
                  <div className="aa-productos-grid">
                    {productos.map(prod => (
                      <div key={prod.id_producto} className="aa-producto-card">
                        <div className="aa-producto-img">
                          {prod.imagen
                            ? <img src={prod.imagen} alt={prod.nombre_producto} />
                            : <div className="aa-producto-no-img"><FiPackage size={20} color="#cbd5e1" /></div>
                          }
                          <span className={`aa-tipo-badge aa-tipo-badge--${prod.tipo}`}>{prod.tipo}</span>
                        </div>
                        <div className="aa-producto-info">
                          <p className="aa-producto-nombre">{prod.nombre_producto}</p>
                          <span className="aa-producto-cat">{prod.categoria}</span>
                          <strong className="aa-producto-precio">{formatPrecio(prod.precio)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="aa-sin-productos">Sin productos activos</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}