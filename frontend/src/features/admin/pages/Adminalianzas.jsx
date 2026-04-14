import { useState, useEffect } from "react"
import axios from "axios"
import {
  FiSearch, FiX, FiUsers, FiCalendar, FiPackage,
  FiChevronDown, FiChevronUp, FiCheck, FiClock, FiFlag
} from "react-icons/fi"
import "@/infrastructure/css/AdminAlianzas.css"

const BASE = "http://localhost:3000"
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })

const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", {
  day: "2-digit", month: "short", year: "numeric"
}) : "Sin fecha límite"

const fmtPrecio = (p) => "$" + Number(p).toLocaleString("es-CO")

const ESTADO_CONFIG = {
  activa:     { cls: "aa-badge--activa",     label: "Activa",     icon: <FiCheck size={10} /> },
  pendiente:  { cls: "aa-badge--pendiente",  label: "Pendiente",  icon: <FiClock size={10} /> },
  finalizada: { cls: "aa-badge--finalizada", label: "Finalizada", icon: <FiFlag  size={10} /> },
}

function getInitials(nombre) {
  if (!nombre) return "?"
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}

const AVATAR_COLORS = ["#3b82f6","#16a34a","#f97316","#a855f7","#ec4899","#0891b2"]
function getAvatarColor(nombre) {
  if (!nombre) return AVATAR_COLORS[0]
  const sum = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

export default function AdminAlianzas() {
  const [alianzas, setAlianzas]   = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [expandido, setExpandido] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get(`${BASE}/api/admin/alianzas`, { headers: hdrs() })
        setAlianzas(Array.isArray(res.data) ? res.data : [])
      } catch (err) { console.error(err) }
      finally { setCargando(false) }
    }
    cargar()
  }, [])

  const filtrados = alianzas.filter(a => {
    const matchB = a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.creador?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.participantes?.some(p => p.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
    const matchF = filtro === "todos" || a.estado === filtro
    return matchB && matchF
  })

  const metricas = [
    { label: "Total",      valor: alianzas.length,                              color: "#3b82f6" },
    { label: "Activas",    valor: alianzas.filter(a => a.estado === "activa").length,    color: "#16a34a" },
    { label: "Pendientes", valor: alianzas.filter(a => a.estado === "pendiente").length, color: "#f97316" },
    { label: "Finalizadas",valor: alianzas.filter(a => a.estado === "finalizada").length,color: "#64748b" },
  ]

  return (
    <div className="aa-page">

      {/* Header */}
      <div className="aa-header">
        <div>
          <h1 className="aa-titulo">Alianzas Promocionales</h1>
          <p className="aa-sub">Supervisa las promociones colaborativas entre emprendedoras</p>
        </div>
      </div>

      {/* Métricas */}
      <div className="aa-metricas">
        {metricas.map(m => (
          <div key={m.label} className="aa-metrica" style={{ borderTop: `3px solid ${m.color}` }}>
            <p className="aa-metrica-label">{m.label}</p>
            <strong className="aa-metrica-valor" style={{ color: m.color }}>{m.valor}</strong>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="aa-filtros">
        <div className="aa-search">
          <FiSearch size={14} color="#94a3b8" />
          <input className="aa-search-input" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar alianza o emprendedora..." />
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

      <p className="aa-contador">Mostrando {filtrados.length} de {alianzas.length} alianzas</p>

      {/* Lista */}
      {cargando ? (
        <p className="aa-cargando">Cargando alianzas...</p>
      ) : filtrados.length === 0 ? (
        <div className="aa-empty">
          <FiUsers size={40} color="#e5e7eb" />
          <p>No hay alianzas</p>
        </div>
      ) : (
        <div className="aa-lista">
          {filtrados.map(a => {
            const est    = ESTADO_CONFIG[a.estado] || ESTADO_CONFIG.pendiente
            const isExp  = expandido === a.id_alianza
            const todosAutorizados = a.participantes?.every(p => p.autorizado)

            return (
              <div key={a.id_alianza} className="aa-card">

                {/* Fila principal */}
                <div className="aa-card-row" onClick={() => setExpandido(isExp ? null : a.id_alianza)}>
                  <div className="aa-card-left">
                    <div className="aa-card-titulo">
                      <span className="aa-card-nombre">{a.nombre}</span>
                      <span className={`aa-badge ${est.cls}`}>
                        {est.icon} {est.label}
                      </span>
                      {!todosAutorizados && (
                        <span className="aa-badge aa-badge--pendiente-auth">
                          <FiClock size={10} /> Esperando autorización
                        </span>
                      )}
                    </div>
                    <div className="aa-card-meta">
                      <span><FiUsers size={11} /> {a.participantes?.length || 0} participantes</span>
                      <span><FiCalendar size={11} /> Creada: {fmtFecha(a.fecha_inicio)}</span>
                      <span><FiCalendar size={11} /> Fin: {fmtFecha(a.fecha_fin)}</span>
                    </div>
                    {a.descripcion && (
                      <p className="aa-card-desc">{a.descripcion}</p>
                    )}
                  </div>

                  {/* Avatares participantes */}
                  <div className="aa-avatares">
                    {a.participantes?.map(p => (
                      <div key={p.id} className="aa-avatar-wrap" title={p.usuario?.nombre}>
                        <div className="aa-avatar" style={{ background: getAvatarColor(p.usuario?.nombre) }}>
                          {getInitials(p.usuario?.nombre)}
                        </div>
                        {p.autorizado && <div className="aa-avatar-check"><FiCheck size={8} /></div>}
                      </div>
                    ))}
                  </div>

                  <div className="aa-chevron">
                    {isExp ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                </div>

                {/* Detalle expandido */}
                {isExp && (
                  <div className="aa-detalle">

                    {/* Participantes con sus productos */}
                    {a.participantes?.map(p => {
                      const productos = p.usuario?.emprendedora?.secciones
                        ?.flatMap(s => s.productos) || []

                      return (
                        <div key={p.id} className="aa-participante">
                          <div className="aa-participante-header">
                            <div className="aa-participante-avatar" style={{ background: getAvatarColor(p.usuario?.nombre) }}>
                              {getInitials(p.usuario?.nombre)}
                            </div>
                            <div>
                              <p className="aa-participante-nombre">{p.usuario?.nombre}</p>
                              <span className="aa-participante-email">{p.usuario?.email}</span>
                            </div>
                            <span className={`aa-auth-badge ${p.autorizado ? "autorizado" : "pendiente"}`}>
                              {p.autorizado ? <><FiCheck size={10} /> Autorizado</> : <><FiClock size={10} /> Pendiente</>}
                            </span>
                          </div>

                          {/* Productos de esta emprendedora */}
                          {productos.length > 0 ? (
                            <div className="aa-productos-grid">
                              {productos.map(prod => (
                                <div key={prod.id_producto} className="aa-producto-card">
                                  <div className="aa-producto-img">
                                    {prod.imagen
                                      ? <img src={prod.imagen} alt={prod.nombre_producto} />
                                      : <div className="aa-producto-no-img"><FiPackage size={20} color="#cbd5e1" /></div>
                                    }
                                    <span className={`aa-tipo-badge aa-tipo-badge--${prod.tipo}`}>
                                      {prod.tipo}
                                    </span>
                                  </div>
                                  <div className="aa-producto-info">
                                    <p className="aa-producto-nombre">{prod.nombre_producto}</p>
                                    <span className="aa-producto-cat">{prod.categoria}</span>
                                    <strong className="aa-producto-precio">{fmtPrecio(prod.precio)}</strong>
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
          })}
        </div>
      )}
    </div>
  )
}