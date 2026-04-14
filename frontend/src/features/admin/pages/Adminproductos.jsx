import { useState, useEffect } from "react"
import axios from "axios"
import { FiPackage, FiEye, FiEyeOff, FiStar, FiSearch, FiX } from "react-icons/fi"
import "@/infrastructure/css/AdminProductos.css"
import "@/infrastructure/css/CrudAdmin.css"

const BASE = "http://localhost:3000"
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })
const formatPrecio = p => "$" + Number(p).toLocaleString("es-CO")
const PAGE_SIZE = 10

export default function AdminProductos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")
  const [filtro, setFiltro]       = useState("todos")
  const [toast, setToast]         = useState(null)
  const [pagina, setPagina]       = useState(1)

  const cargar = async () => {
    try {
      const res = await axios.get(`${BASE}/api/items/admin/todos`, { headers: headers() })
      setProductos(res.data)
    } catch (err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])
  useEffect(() => { setPagina(1) }, [busqueda, filtro])

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleVisible = async (id, visible) => {
    try {
      await axios.patch(`${BASE}/api/items/${id}/visible`, {}, { headers: headers() })
      setProductos(prev => prev.map(p => p.id_producto === id ? { ...p, visible: !visible } : p))
      mostrarToast(visible ? "Producto ocultado" : "Producto visible")
    } catch { mostrarToast("Error al cambiar visibilidad", "error") }
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
    const matchF = filtro === "todos"       ? true
      : filtro === "activos"    ? p.visible
      : filtro === "ocultos"    ? !p.visible
      : filtro === "destacados" ? p.destacado
      : true
    return matchB && matchF
  })

  const totalPaginas    = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const productosPagina = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  return (
    <div className="ap-container">

      {/* Toast */}
      {toast && <div className={`ap-toast ${toast.tipo}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="ap-header">
        <h1>Gestionar Productos</h1>
        <p>Supervisa y modera todos los productos de la plataforma</p>
      </div>

      {/* Métricas */}
      <div className="ap-metricas">
        <div className="ap-metrica-card">
          <p>Total</p>
          <strong className="ap-metrica-valor total">{productos.length}</strong>
        </div>
        <div className="ap-metrica-card">
          <p>Visibles</p>
          <strong className="ap-metrica-valor visibles">{productos.filter(p => p.visible).length}</strong>
        </div>
        <div className="ap-metrica-card">
          <p>Ocultos</p>
          <strong className="ap-metrica-valor ocultos">{productos.filter(p => !p.visible).length}</strong>
        </div>
        <div className="ap-metrica-card">
          <p>Destacados</p>
          <strong className="ap-metrica-valor destacados">{productos.filter(p => p.destacado).length}</strong>
        </div>
      </div>

      {/* Filtros */}
      <div className="ap-filtros">
        <div className="ap-search-box">
          <FiSearch size={14} color="#94a3b8" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar producto o emprendedora..."
          />
          {busqueda && (
            <button className="ap-search-clear" onClick={() => setBusqueda("")}>
              <FiX size={13} />
            </button>
          )}
        </div>
        <select className="ap-select" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="activos">Visibles</option>
          <option value="ocultos">Ocultos</option>
          <option value="destacados">Destacados</option>
        </select>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p className="ap-loading">Cargando...</p>
      ) : (
        <>
          <div className="ap-table-wrapper">
            <table className="ap-table">
              <thead>
                <tr>
                  {["#", "Producto", "Emprendedora", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productosPagina.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="ap-empty">No hay productos</td>
                  </tr>
                ) : productosPagina.map((p, i) => {
                  const stock = p.inventario?.cantidad ?? null
                  return (
                    <tr key={p.id_producto}>

                      <td>{(pagina - 1) * PAGE_SIZE + i + 1}</td>

                      <td>
                        <div className="ap-producto-cell">
                          {p.imagen
                            ? <img src={p.imagen} alt="" className="ap-producto-img" />
                            : <div className="ap-producto-placeholder"><FiPackage size={16} color="#94a3b8" /></div>
                          }
                          <span className="ap-producto-nombre">{p.nombre_producto}</span>
                        </div>
                      </td>

                      <td>{p.seccion?.emprendedora?.usuario?.nombre || "—"}</td>
                      <td>{p.categoria || "—"}</td>
                      <td className="ap-precio">{formatPrecio(p.precio)}</td>

                      <td>
                        <span className={`ap-stock-badge ${stock === 0 ? "agotado" : "disponible"}`}>
                          {stock ?? "—"}
                        </span>
                      </td>

                      <td>
                        <span className={`ap-estado-badge ${p.visible ? "visible" : "oculto"}`}>
                          {p.visible ? "Visible" : "Oculto"}
                        </span>
                      </td>

                      <td>
                        <div className="ap-acciones">
                          <button
                            className="ap-btn-accion"
                            onClick={() => toggleVisible(p.id_producto, p.visible)}
                          >
                            {p.visible ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                            {p.visible ? "Ocultar" : "Mostrar"}
                          </button>
                          <button
                            className={`ap-btn-accion ${p.destacado ? "destacado" : ""}`}
                            onClick={() => toggleDestacado(p.id_producto, p.destacado)}
                          >
                            <FiStar size={13} fill={p.destacado ? "#f59e0b" : "none"} color={p.destacado ? "#f59e0b" : "#374151"} />
                            {p.destacado ? "Quitar" : "Destacar"}
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="crud-pagination">
              <span className="pagination-info">
                {filtrados.length} producto{filtrados.length !== 1 ? "s" : ""} · Página {pagina} de {totalPaginas}
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