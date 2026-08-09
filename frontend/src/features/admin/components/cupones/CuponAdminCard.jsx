import { FiTag, FiPercent, FiCalendar, FiUser, FiToggleLeft, FiToggleRight, FiTrash2 } from "react-icons/fi"
import { formatFecha } from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/cupones/CuponAdminCard.css"

function fmtValor(tipo, valor) {
  return tipo === "porcentaje" ? `${valor}%` : "$" + Number(valor).toLocaleString("es-CO")
}

function getBadgeEstado(c) {
  const isVencido = c.fecha_fin && new Date() > new Date(c.fecha_fin)
  const isAgotado = c.limite_usos && c.usos >= c.limite_usos
  if (isVencido) return { cls: "ac-badge--vencido",  label: "Vencido"  }
  if (isAgotado) return { cls: "ac-badge--agotado",  label: "Agotado"  }
  if (c.activo)  return { cls: "ac-badge--activo",   label: "Activo"   }
  return               { cls: "ac-badge--inactivo", label: "Inactivo" }
}

export function CuponAdminCard({ cupon: c, onToggle, onEliminar }) {
  const badge    = getBadgeEstado(c)
  const isVencido = c.fecha_fin && new Date() > new Date(c.fecha_fin)
  const isAgotado = c.limite_usos && c.usos >= c.limite_usos
  const esActivo  = c.activo && !isVencido && !isAgotado

  return (
    <div className={`ac-card ${esActivo ? "ac-card--activo" : "ac-card--inactivo-borde"} ${!c.activo ? "ac-card--inactivo" : ""}`}>
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
        <button className="ac-btn-toggle"
          onClick={() => onToggle(c.id_cupon, c.activo)}
          title={c.activo ? "Desactivar" : "Activar"}>
          {c.activo
            ? <FiToggleRight size={22} color="#16a34a" />
            : <FiToggleLeft  size={22} color="#94a3b8" />
          }
        </button>
        <button className="ac-btn-eliminar" onClick={() => onEliminar(c.id_cupon)}>
          <FiTrash2 size={13} /> Eliminar
        </button>
      </div>
    </div>
  )
}