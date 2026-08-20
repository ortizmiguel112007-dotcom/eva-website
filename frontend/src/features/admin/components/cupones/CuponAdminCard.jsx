import { FiTag, FiPercent, FiCalendar, FiUser, FiSlash, FiCheckCircle } from "react-icons/fi"
import { formatFecha } from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/cupones/CuponAdminCard.css"

function fmtValor(tipo, valor) {
  return tipo === "porcentaje" ? `${valor}%` : "$" + Number(valor).toLocaleString("es-CO")
}

function getBadgeEstado(c) {
  const ahora         = new Date()
  const isVencido      = c.fecha_fin && ahora > new Date(c.fecha_fin)
  const isAgotado      = c.limite_usos && c.usos >= c.limite_usos
  const isProgramado   = c.fecha_inicio && ahora < new Date(c.fecha_inicio)
  if (isVencido)    return { cls: "ac-badge--vencido",    label: "Vencido"    }
  if (isAgotado)    return { cls: "ac-badge--agotado",    label: "Agotado"    }
  if (isProgramado) return { cls: "ac-badge--programado", label: "Programado" }
  if (c.activo)     return { cls: "ac-badge--activo",     label: "Activo"     }
  return              { cls: "ac-badge--inactivo",        label: "Inactivo"   }
}

// RF-101/RN-089: el admin audita y puede desactivar cualquier cupón,
// pero NO crea, edita, reactiva ni elimina cupones ajenos (RN-083/RN-088).
export function CuponAdminCard({ cupon: c, onDesactivar }) {
  const badge = getBadgeEstado(c)

  return (
    <div className={`ac-card ${c.activo ? "ac-card--activo" : "ac-card--inactivo"}`}>
      <div className={`ac-card-icono ac-card-icono--${c.tipo === "porcentaje" ? "porcentaje" : "fijo"}`}>
        {c.tipo === "porcentaje"
          ? <FiPercent size={16} color="#3b82f6" />
          : <FiTag     size={16} color="#16a34a" />
        }
      </div>

      <div className="ac-card-info">
        <div className="ac-card-titulo">
          <span className="ac-codigo">{c.codigo}</span>
          <span className={`ac-badge ${badge.cls}`}>{badge.label}</span>
          <span className={`ac-badge-tipo ac-badge-tipo--${c.tipo === "porcentaje" ? "porcentaje" : "fijo"}`}>
            {fmtValor(c.tipo, c.valor)} OFF
          </span>
        </div>
        <div className="ac-card-meta">
          {c.descripcion && <span>{c.descripcion}</span>}
          <span><FiCalendar size={11} /> Vence: {formatFecha(c.fecha_fin) || "Sin límite"}</span>
          <span><FiUser size={11} /> {c.usuario?.nombre}</span>
          {c.limite_usos && <span>{c.usos}/{c.limite_usos} usos</span>}
        </div>
      </div>

      <div className="ac-card-acciones">
        {c.activo ? (
          <button className="ac-btn-desactivar" onClick={onDesactivar} title="Desactivar por uso indebido">
            <FiSlash size={13} /> Desactivar
          </button>
        ) : (
          <span className="ac-ya-inactivo">
            <FiCheckCircle size={13} /> Ya inactivo
          </span>
        )}
      </div>
    </div>
  )
}