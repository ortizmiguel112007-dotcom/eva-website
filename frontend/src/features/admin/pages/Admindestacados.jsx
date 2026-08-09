import { useState, useEffect } from "react"
import axios from "axios"
import { FiSearch, FiX } from "react-icons/fi"

import { DestacadoAdminCard } from "../components/destacados/DestacadoAdminCard"
import { getHeaders }         from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/destacados/AdminDestacados.css"

const BASE = "http://localhost:3000"

export default function AdminDestacados() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [toast, setToast]         = useState(null)

  useEffect(() => {
    axios.get(`${BASE}/api/items/admin/todos`, { headers: getHeaders() })
      .then(res => setProductos(res.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleDestacado = async (id, destacado) => {
    try {
      await axios.put(`${BASE}/api/destacados/${id}`, {}, { headers: getHeaders() })
      setProductos(prev => prev.map(p => p.id_producto === id ? { ...p, destacado: !destacado } : p))
      mostrarToast(destacado ? "Quitado de destacados" : "Marcado como destacado")
    } catch { mostrarToast("Error", "error") }
  }

  const filtrados = productos.filter(p => {
    const matchB =
      p.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.seccion?.emprendedora?.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchF = filtro === "todos" ? true : filtro === "destacados" ? p.destacado : !p.destacado
    return matchB && matchF
  })

  const totalDestacados = productos.filter(p => p.destacado).length

  return (
    <div className="ad-container">
      {toast && <div className={`ad-toast ${toast.tipo}`}>{toast.msg}</div>}

      <div className="ad-header">
        <h1>Productos Destacados</h1>
        <p>Aprueba o elimina productos destacados en la plataforma</p>
      </div>

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

      <div className="ad-filtros">
        <div className="ad-search-box">
          <FiSearch size={14} color="#94a3b8" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar producto o emprendedora..." />
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

      {cargando ? (
        <p className="ad-loading">Cargando...</p>
      ) : (
        <div className="ad-grid">
          {filtrados.length === 0 ? (
            <div className="ad-empty">No hay productos</div>
          ) : filtrados.map(p => (
            <DestacadoAdminCard
              key={p.id_producto}
              producto={p}
              onToggle={toggleDestacado}
            />
          ))}
        </div>
      )}
    </div>
  )
}