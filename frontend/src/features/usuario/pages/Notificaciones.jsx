import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import {
  FiBell, FiCheck, FiCheckCircle, FiPackage,
  FiTag, FiUsers, FiStar, FiAlertCircle, FiDollarSign
} from "react-icons/fi"
import "@/infrastructure/css/Notificaciones.css"

const BASE = "http://localhost:3000"
const hdrs = (token) => ({ Authorization: `Bearer ${token}` })

function formatFecha(f) {
  const fecha = new Date(f)
  const ahora = new Date()
  const diff = Math.floor((ahora - fecha) / 1000)
  if (diff < 60) return "Ahora mismo"
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
}

const TIPO_CONFIG = {
  pedido:    { icon: FiPackage,     color: "#3b82f6", bg: "#eff6ff",  label: "Pedido"    },
  pago:      { icon: FiDollarSign,  color: "#16a34a", bg: "#f0fdf4",  label: "Pago"      },
  cupon:     { icon: FiTag,         color: "#f97316", bg: "#fff7ed",  label: "Cupón"     },
  solicitud: { icon: FiUsers,       color: "#8b5cf6", bg: "#f5f3ff",  label: "Solicitud" },
  comentario:{ icon: FiStar,        color: "#f59e0b", bg: "#fffbeb",  label: "Reseña"    },
  stock:     { icon: FiAlertCircle, color: "#ef4444", bg: "#fff1f2",  label: "Stock"     },
}

const FILTROS_CLIENTE = [
  { key: "todas",      label: "Todas"       },
  { key: "no_leidas",  label: "Sin leer"    },
  { key: "pedido",     label: "Pedidos"     },
  { key: "cupon",      label: "Cupones"     },
  { key: "solicitud",  label: "Solicitudes" },
]

const FILTROS_EMP = [
  { key: "todas",      label: "Todas"    },
  { key: "no_leidas",  label: "Sin leer" },
  { key: "pedido",     label: "Pedidos"  },
  { key: "pago",       label: "Pagos"    },
  { key: "comentario", label: "Reseñas"  },
  { key: "stock",      label: "Stock"    },
  { key: "solicitud",  label: "Alianzas" },
]

export default function Notificaciones() {
  const { token, user } = useAuth()
  const navigate         = useNavigate()
  const isEmprendedora   = user?.rol === "emprendedora"

  const [notifs, setNotifs]     = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro]     = useState("todas")

  const filtrosDisponibles = isEmprendedora ? FILTROS_EMP : FILTROS_CLIENTE

  useEffect(() => { cargar() }, [token])

  const cargar = async () => {
    try {
      const res = await axios.get(`${BASE}/api/notificaciones`, { headers: hdrs(token) })
      setNotifs(Array.isArray(res.data) ? res.data : [])
    } catch { setNotifs([]) }
    finally { setCargando(false) }
  }

  const marcarLeida = async (id) => {
    try {
      await axios.put(`${BASE}/api/notificaciones/${id}/leer`, {}, { headers: hdrs(token) })
      setNotifs(prev => prev.map(n => n.id_notificacion === id ? { ...n, leida: true } : n))
    } catch {}
  }

  const marcarTodas = async () => {
    try {
      await axios.put(`${BASE}/api/notificaciones/leer-todas`, {}, { headers: hdrs(token) })
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
    } catch {}
  }

  const handleClick = (n) => {
    if (!n.leida) marcarLeida(n.id_notificacion)
    if (n.url) navigate(n.url)
  }

  const noLeidas = notifs.filter(n => !n.leida).length

  const filtradas = filtro === "todas"     ? notifs
    : filtro === "no_leidas" ? notifs.filter(n => !n.leida)
    : notifs.filter(n => n.tipo === filtro)

  if (cargando) return (
    <div className="noti-loading">
      <div className="noti-spinner" />
      <p>Cargando notificaciones...</p>
    </div>
  )

  return (
    <div className="noti-page">

      {/* Header */}
      <div className="noti-header">
        <div className="noti-header-left">
          <div className="noti-header-icono">
            <FiBell size={22} color="#3b82f6" />
            {noLeidas > 0 && <span className="noti-badge-num">{noLeidas}</span>}
          </div>
          <div>
            <h1 className="noti-titulo">Notificaciones</h1>
            <p className="noti-sub">
              {noLeidas > 0 ? `${noLeidas} sin leer` : "Todo al día ✓"}
            </p>
          </div>
        </div>
        {noLeidas > 0 && (
          <button className="noti-btn-marcar-todas" onClick={marcarTodas}>
            <FiCheckCircle size={14} /> Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="noti-filtros">
        {filtrosDisponibles.map(f => (
          <button key={f.key}
            className={`noti-filtro ${filtro === f.key ? "active" : ""}`}
            onClick={() => setFiltro(f.key)}>
            {f.key === "no_leidas" ? `Sin leer (${noLeidas})` : f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="noti-empty">
          <div className="noti-empty-icono"><FiBell size={36} color="#93c5fd" /></div>
          <h3>Sin notificaciones</h3>
          <p>{filtro === "no_leidas" ? "¡Todo al día!" : "No hay notificaciones en esta categoría"}</p>
        </div>
      ) : (
        <div className="noti-lista">
          {filtradas.map((n, idx) => {
            const cfg  = TIPO_CONFIG[n.tipo] || TIPO_CONFIG.pedido
            const Icon = cfg.icon
            return (
              <div key={n.id_notificacion}
                className={`noti-item ${n.leida ? "leida" : "no-leida"}`}
                style={{ animationDelay: `${idx * 0.04}s` }}
                onClick={() => handleClick(n)}>

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
                    onClick={e => { e.stopPropagation(); marcarLeida(n.id_notificacion) }}
                    title="Marcar como leída">
                    <FiCheck size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}