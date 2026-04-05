import { useState, useEffect } from "react"
import axios from "axios"
import { FiStar, FiSearch, FiX, FiPackage } from "react-icons/fi"
import "@/infrastructure/css/AdminDestacados.css"

const BASE = "http://localhost:3000"
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })
const formatPrecio = p => "$" + Number(p).toLocaleString("es-CO")

export default function AdminDestacados() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [toast, setToast]         = useState(null)

  const cargar = async () => {
    try {
      const res = await axios.get(`${BASE}/api/items/admin/todos`, { headers: headers() })
      setProductos(res.data)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleDestacado = async (id, destacado) => {
    try {
      await axios.put(`${BASE}/api/destacados/${id}`, {}, { headers: headers() })
      setProductos(prev => prev.map(p => p.id_producto === id ? { ...p, destacado: !destacado } : p))
      mostrarToast(destacado ? "Quitado de destacados" : "Marcado como destacado")
    } catch { mostrarToast("Error", "error") }
  }

  const filtrados = productos.filter(p => {
    const matchB = p.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.seccion?.emprendedora?.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" ? true : filtro === "destacados" ? p.destacado : !p.destacado
    return matchB && matchF
  })

  const totalDestacados = productos.filter(p => p.destacado).length

  return (
    <div className="ad-container">

      {/* Toast */}
      {toast && <div className={`ad-toast ${toast.tipo}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="ad-header">
        <h1>Productos Destacados</h1>
        <p>Aprueba o elimina productos destacados en la plataforma</p>
      </div>

      {/* Métricas */}
      <div className="ad-metricas">
        <div className="ad-metrica-card">
          <p>Total productos</p>
          <strong className="ad-metrica-valor total">{productos.length}</strong>
        </div>
        <div className="ad-metrica-card">
          <p>Destacados</p>
          <strong className="ad-metrica-valor destacados">{totalDestacados}</strong>
        </div>
        <div className="ad-metrica-card">
          <p>Sin destacar</p>
          <strong className="ad-metrica-valor normales">{productos.length - totalDestacados}</strong>
        </div>
      </div>

      {/* Filtros */}
      <div className="ad-filtros">
        <div className="ad-search-box">
          <FiSearch size={14} color="#94a3b8" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar producto o emprendedora..."
          />
          {busqueda && (
            <button className="ad-search-clear" onClick={() => setBusqueda("")}>
              <FiX size={13} />
            </button>
          )}
        </div>
        <select className="ad-select" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="destacados">Solo destacados</option>
          <option value="normales">Sin destacar</option>
        </select>
      </div>

      {/* Grid */}
      {cargando ? (
        <p className="ad-loading">Cargando...</p>
      ) : (
        <div className="ad-grid">
          {filtrados.length === 0 ? (
            <div className="ad-empty">No hay productos</div>
          ) : filtrados.map(p => (
            <div key={p.id_producto} className={`ad-card ${p.destacado ? "destacado" : ""}`}>

              {/* Imagen */}
              <div className="ad-card-img">
                {p.imagen
                  ? <img src={p.imagen} alt={p.nombre_producto} />
                  : <div className="ad-card-placeholder"><FiPackage size={36} color="#cbd5e1" /></div>
                }
                {p.destacado && (
                  <span className="ad-badge-destacado">⭐ Destacado</span>
                )}
              </div>

              {/* Body */}
              <div className="ad-card-body">
                <h3>{p.nombre_producto}</h3>
                <p className="ad-card-meta">
                  {p.seccion?.emprendedora?.usuario?.nombre || "EVA"} · {p.categoria}
                </p>
                <div className="ad-card-footer">
                  <span className="ad-precio">{formatPrecio(p.precio)}</span>
                  <button
                    className={`ad-btn-destacar ${p.destacado ? "activo" : ""}`}
                    onClick={() => toggleDestacado(p.id_producto, p.destacado)}
                  >
                    <FiStar
                      size={13}
                      fill={p.destacado ? "#f59e0b" : "none"}
                      color={p.destacado ? "#f59e0b" : "#374151"}
                    />
                    {p.destacado ? "Quitar" : "Destacar"}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}