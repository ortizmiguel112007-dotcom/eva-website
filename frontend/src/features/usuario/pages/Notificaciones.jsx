import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import { FiBell, FiCheckCircle } from "react-icons/fi"

import { NotificacionItem } from "../components/notificaciones/NotificacionItem"
import { FiltrosNotificaciones } from "../components/notificaciones/FiltrosNotificaciones"

import "@/infrastructure/css/usuario/notificaciones/Notificaciones.css"

const BASE = "http://localhost:3000"
const hdrs = token => ({ Authorization: `Bearer ${token}` })

export default function Notificaciones() {
  const { token, user } = useAuth()
  const navigate         = useNavigate()
  const isEmprendedora   = user?.rol === "emprendedora"

  const [notifs, setNotifs]     = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro]     = useState("todas")

  useEffect(() => {
    axios.get(`${BASE}/api/notificaciones`, { headers: hdrs(token) })
      .then(res => setNotifs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setNotifs([]))
      .finally(() => setCargando(false))
  }, [token])

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

  const filtradas = filtro === "todas"    ? notifs
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

      <FiltrosNotificaciones
        isEmprendedora={isEmprendedora}
        filtro={filtro}
        setFiltro={setFiltro}
        noLeidas={noLeidas}
      />

      {filtradas.length === 0 ? (
        <div className="noti-empty">
          <div className="noti-empty-icono"><FiBell size={36} color="#93c5fd" /></div>
          <h3>Sin notificaciones</h3>
          <p>{filtro === "no_leidas" ? "¡Todo al día!" : "No hay notificaciones en esta categoría"}</p>
        </div>
      ) : (
        <div className="noti-lista">
          {filtradas.map((n, idx) => (
            <NotificacionItem
              key={n.id_notificacion}
              notif={n}
              idx={idx}
              onClick={handleClick}
              onMarcarLeida={marcarLeida}
            />
          ))}
        </div>
      )}
    </div>
  )
}