import { useState, useEffect } from "react"
import axios from "axios"
import { FiUsers, FiSearch, FiX, FiCalendar, FiCheck, FiXCircle } from "react-icons/fi"
import "@/infrastructure/css/AdminAlianzas.css"

const BASE = "http://localhost:3000"
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })
const formatFecha = f => f ? new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : "—"

export default function AdminAlianzas() {
  const [alianzas, setAlianzas]   = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [toast, setToast]         = useState(null)
  const [expandido, setExpandido] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get(`${BASE}/api/alianzas`, { headers: headers() })
        setAlianzas(Array.isArray(res.data) ? res.data : [])
      } catch { setAlianzas([]) }
      finally { setCargando(false) }
    }
    cargar()
  }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const finalizar = async (id) => {
    if (!confirm("¿Finalizar esta alianza?")) return
    try {
      await axios.put(`${BASE}/api/alianzas/${id}/finalizar`, {}, { headers: headers() })
      setAlianzas(prev => prev.map(a => a.id_alianza === id ? { ...a, estado: "finalizada" } : a))
      mostrarToast("Alianza finalizada")
    } catch { mostrarToast("Error", "error") }
  }

  const filtrados = alianzas.filter(a => {
    const matchB = a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.creador?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" || a.estado === filtro
    return matchB && matchF
  })

  const metricas = {
    total:      alianzas.length,
    activas:    alianzas.filter(a => a.estado === "activa").length,
    pendientes: alianzas.filter(a => a.estado === "pendiente").length,
    finalizadas: alianzas.filter(a => a.estado === "finalizada").length,
  }

  return (
    <div className="aa-container">

      {/* Toast */}
      {toast && <div className={`aa-toast ${toast.tipo}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="aa-header">
        <h1>Alianzas Promocionales</h1>
        <p>Supervisa las promociones colaborativas entre emprendedoras</p>
      </div>

      {/* Métricas */}
      <div className="aa-metricas">
        <div className="aa-metrica-card">
          <p>Total</p>
          <strong className="aa-metrica-valor total">{metricas.total}</strong>
        </div>
        <div className="aa-metrica-card">
          <p>Activas</p>
          <strong className="aa-metrica-valor activas">{metricas.activas}</strong>
        </div>
        <div className="aa-metrica-card">
          <p>Pendientes</p>
          <strong className="aa-metrica-valor pendientes">{metricas.pendientes}</strong>
        </div>
        <div className="aa-metrica-card">
          <p>Finalizadas</p>
          <strong className="aa-metrica-valor finalizadas">{metricas.finalizadas}</strong>
        </div>
      </div>

      {/* Filtros */}
      <div className="aa-filtros">
        <div className="aa-search-box">
          <FiSearch size={14} color="#94a3b8" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar alianza o emprendedora..."
          />
          {busqueda && (
            <button className="aa-search-clear" onClick={() => setBusqueda("")}>
              <FiX size={13} />
            </button>
          )}
        </div>
        <select className="aa-select" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="activa">Activas</option>
          <option value="pendiente">Pendientes</option>
          <option value="finalizada">Finalizadas</option>
        </select>
      </div>

      {/* Lista */}
      {cargando ? (
        <p className="aa-loading">Cargando...</p>
      ) : (
        <div className="aa-lista">
          {filtrados.length === 0 ? (
            <div className="aa-empty">
              <FiUsers size={40} color="#e5e7eb" style={{ marginBottom: "0.75rem" }} />
              <p>No hay alianzas</p>
            </div>
          ) : filtrados.map(a => {
            const isExp = expandido === a.id_alianza
            return (
              <div key={a.id_alianza} className="aa-card">

                {/* Header de la card */}
                <div className="aa-card-header" onClick={() => setExpandido(isExp ? null : a.id_alianza)}>
                  <div className="aa-card-icon">
                    <FiUsers size={16} color="#6366f1" />
                  </div>

                  <div className="aa-card-info">
                    <div className="aa-card-title-row">
                      <span className="aa-card-nombre">{a.nombre}</span>
                      <span className={`aa-badge ${a.estado}`}>
                        {{ pendiente: "Pendiente", activa: "Activa", finalizada: "Finalizada" }[a.estado]}
                      </span>
                    </div>
                    <div className="aa-card-meta">
                      <span><FiUsers size={11} /> Creada por: {a.creador?.nombre || "—"}</span>
                      <span><FiCalendar size={11} /> Inicio: {formatFecha(a.fecha_inicio)}</span>
                      {a.fecha_fin && <span>Fin: {formatFecha(a.fecha_fin)}</span>}
                      <span>{a.participantes?.length || 0} participante(s)</span>
                    </div>
                  </div>

                  {a.estado === "activa" && (
                    <button
                      className="aa-btn-finalizar"
                      onClick={e => { e.stopPropagation(); finalizar(a.id_alianza) }}
                    >
                      <FiXCircle size={13} /> Finalizar
                    </button>
                  )}

                  <span className="aa-chevron">{isExp ? "▲" : "▼"}</span>
                </div>

                {/* Body expandido */}
                {isExp && (
                  <div className="aa-card-body">
                    {a.descripcion && <p className="aa-card-desc">{a.descripcion}</p>}
                    <p className="aa-participantes-label">Participantes</p>
                    <div className="aa-participantes-list">
                      {a.participantes?.map(p => (
                        <span
                          key={p.id}
                          className={`aa-participante-badge ${p.autorizado ? "autorizado" : "pendiente"}`}
                        >
                          {p.autorizado ? <FiCheck size={11} /> : <FiX size={11} />}
                          {p.usuario?.nombre || "—"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}