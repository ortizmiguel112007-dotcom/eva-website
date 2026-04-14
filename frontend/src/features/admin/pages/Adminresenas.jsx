import { useState, useEffect } from "react"
import axios from "axios"
import { FiStar, FiEyeOff, FiSearch, FiX, FiPackage, FiMessageSquare } from "react-icons/fi"
import "@/infrastructure/css/AdminResenas.css"
import "@/infrastructure/css/CrudAdmin.css"

const BASE  = "http://localhost:3000"
const hdrs  = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })
const fmtFecha = f => new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
const PAGE_SIZE = 10

function Estrellas({ valor }) {
  return (
    <div className="ar-estrellas">
      {[1,2,3,4,5].map(i => (
        <FiStar key={i} size={12}
          fill={i <= valor ? "#f59e0b" : "none"}
          color={i <= valor ? "#f59e0b" : "#4a3050"} />
      ))}
      <span className="ar-estrella-num">{valor}.0</span>
    </div>
  )
}

export default function AdminResenas() {
  const [resenas, setResenas]   = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro]     = useState("activos")
  const [toast, setToast]       = useState(null)
  const [pagina, setPagina]     = useState(1)

  const cargar = async () => {
    try {
      const res = await axios.get(`${BASE}/api/admin/comentarios`, { headers: hdrs() })
      setResenas(Array.isArray(res.data) ? res.data : [])
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])
  useEffect(() => { setPagina(1) }, [busqueda, filtro])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const ocultar = async (id) => {
    try {
      await axios.put(`${BASE}/api/comentarios/${id}/ocultar`, {}, { headers: hdrs() })
      setResenas(prev => prev.map(r => r.id_comentario === id ? { ...r, activo: false } : r))
      mostrarToast("Comentario ocultado")
    } catch { mostrarToast("Error", "error") }
  }

  const filtrados = resenas.filter(r => {
    const matchB = r.texto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.producto_nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" ? true : filtro === "activos" ? r.activo : !r.activo
    return matchB && matchF
  })

  const totalPaginas  = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const resenasPagina = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  const metricas = [
    { label: "Total",   valor: resenas.length,                        cls: "total"  },
    { label: "Activos", valor: resenas.filter(r => r.activo).length,  cls: "activo" },
    { label: "Ocultos", valor: resenas.filter(r => !r.activo).length, cls: "oculto" },
  ]

  return (
    <div className="ar-page">

      {/* Toast */}
      {toast && <div className={`ar-toast ${toast.tipo}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="ar-header">
        <h1 className="ar-titulo">Moderar Comentarios</h1>
        <p className="ar-sub">Supervisa y modera las reseñas de la plataforma</p>
      </div>

      {/* Métricas */}
      <div className="ar-metricas">
        {metricas.map(m => (
          <div key={m.label} className={`ar-metrica ar-metrica--${m.cls}`}>
            <p className="ar-metrica-label">{m.label}</p>
            <strong className="ar-metrica-valor">{m.valor}</strong>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="ar-filtros">
        <div className="ar-search">
          <FiSearch size={14} color="#94a3b8" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por texto, usuario o producto..."
            className="ar-search-input" />
          {busqueda && (
            <button onClick={() => setBusqueda("")} className="ar-search-clear">
              <FiX size={13} />
            </button>
          )}
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} className="ar-select">
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="ocultos">Ocultos</option>
        </select>
      </div>

      {/* Contador */}
      <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.75rem", fontWeight: 600 }}>
        Mostrando {filtrados.length} de {resenas.length} comentarios
      </p>

      {/* Lista */}
      {cargando ? (
        <p className="ar-cargando">Cargando comentarios...</p>
      ) : (
        <>
          <div className="ar-lista">
            {resenasPagina.length === 0 ? (
              <div className="ar-empty">
                <FiMessageSquare size={40} color="#4a3050" />
                <p>No hay comentarios</p>
              </div>
            ) : resenasPagina.map(r => (
              <div key={r.id_comentario} className={`ar-card ${!r.activo ? "ar-card--oculto" : ""}`}>

                <div className={`ar-card-stripe ${r.activo ? "activo" : "oculto"}`} />

                <div className="ar-card-header">
                  <div className="ar-card-info">
                    <div className="ar-card-usuario">
                      <div className="ar-avatar">
                        {(r.usuario?.nombre || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="ar-usuario-nombre">{r.usuario?.nombre || "Usuario"}</span>
                        <div className="ar-card-meta">
                          <span><FiPackage size={11} /> {r.producto_nombre || "Producto"}</span>
                          <span>· {fmtFecha(r.fecha)}</span>
                        </div>
                      </div>
                    </div>
                    <Estrellas valor={r.calificacion} />
                  </div>

                  <div className="ar-card-acciones">
                    <span className={`ar-badge ${r.activo ? "activo" : "oculto"}`}>
                      {r.activo ? "Activo" : "Oculto"}
                    </span>
                    {r.activo && (
                      <button onClick={() => ocultar(r.id_comentario)} className="ar-btn-ocultar">
                        <FiEyeOff size={13} /> Ocultar
                      </button>
                    )}
                  </div>
                </div>

                <blockquote className="ar-card-texto">"{r.texto}"</blockquote>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="crud-pagination">
              <span className="pagination-info">
                {filtrados.length} comentario{filtrados.length !== 1 ? "s" : ""} · Página {pagina} de {totalPaginas}
              </span>
              <div className="pagination-controls">
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(1)} disabled={pagina === 1}>«</button>
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>‹</button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`page-btn ${n === pagina ? "page-btn-active" : ""}`} onClick={() => setPagina(n)}>{n}</button>
                ))}
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>›</button>
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>»</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}