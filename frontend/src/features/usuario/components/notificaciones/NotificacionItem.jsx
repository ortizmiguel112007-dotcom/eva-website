import { FiCheck } from "react-icons/fi"
import "@/infrastructure/css/usuario/notificaciones/NotificacionItem.css"

const TIPO_CONFIG = {
  pedido:     { icon: null, color: "#3b82f6", bg: "#eff6ff",  label: "Pedido"    },
  pago:       { icon: null, color: "#16a34a", bg: "#f0fdf4",  label: "Pago"      },
  cupon:      { icon: null, color: "#f97316", bg: "#fff7ed",  label: "Cupón"     },
  solicitud:  { icon: null, color: "#8b5cf6", bg: "#f5f3ff",  label: "Solicitud" },
  comentario: { icon: null, color: "#f59e0b", bg: "#fffbeb",  label: "Reseña"    },
  stock:      { icon: null, color: "#ef4444", bg: "#fff1f2",  label: "Stock"     },
  cita:       { icon: null, color: "#0ea5e9", bg: "#f0f9ff",  label: "Cita"      },
}

export { TIPO_CONFIG }

import {
  FiPackage, FiDollarSign, FiTag,
  FiUsers, FiStar, FiAlertCircle,FiCalendar
} from "react-icons/fi"

const TIPO_ICONS = {
  pedido:     FiPackage,
  pago:       FiDollarSign,
  cupon:      FiTag,
  solicitud:  FiUsers,
  comentario: FiStar,
  stock:      FiAlertCircle,
   cita:       FiCalendar,
}

function formatFecha(f) {
  const fecha = new Date(f)
  const ahora = new Date()
  const diff  = Math.floor((ahora - fecha) / 1000)
  if (diff < 60)    return "Ahora mismo"
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
}

export function NotificacionItem({ notif: n, idx, onClick, onMarcarLeida }) {
  const cfg  = TIPO_CONFIG[n.tipo] || TIPO_CONFIG.pedido
  const Icon = TIPO_ICONS[n.tipo]  || TIPO_ICONS.pedido

  return (
    <div
      className={`noti-item ${n.leida ? "leida" : "no-leida"}`}
      style={{ animationDelay: `${idx * 0.04}s` }}
      onClick={() => onClick(n)}
    >
      {!n.leida && <div className="noti-dot" />}

      <div className="noti-icono" style={{ background: cfg.bg }}>
        <Icon size={18} color={cfg.color} />
      </div>

      <div className="noti-contenido">
        <p className="noti-item-titulo">{n.titulo}</p>
        <p className="noti-item-msg">{n.mensaje}</p>
        <div className="noti-item-meta">
          <span className="noti-tipo-badge" style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
          <span className="noti-fecha">{formatFecha(n.fecha)}</span>
        </div>
      </div>

      {!n.leida && (
        <button className="noti-btn-leer"
          onClick={e => { e.stopPropagation(); onMarcarLeida(n.id_notificacion) }}
          title="Marcar como leída">
          <FiCheck size={13} />
        </button>
      )}
    </div>
  )
}