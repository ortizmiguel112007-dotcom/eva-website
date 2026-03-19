import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { tiendaService } from "../services/tienda.service"
import "@/infrastructure/css/PerfilTienda.css"

export default function PerfilTienda() {
  const { id_emprendedora } = useParams()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState("Todos")

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await tiendaService.obtenerProductos(id_emprendedora)
        setProductos(data)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id_emprendedora])

  const filtrados = productos.filter(p =>
    filtroTipo === "Todos" || p.tipo === filtroTipo.toLowerCase()
  )

  if (cargando) return <div className="tienda-loading">Cargando tienda...</div>

  return (
    <div className="tienda-container">

      {/* Header */}
      <div className="tienda-header">
        <h1>Tienda</h1>
        <p>{productos.length} productos disponibles</p>
      </div>

      {/* Filtros */}
      <div className="tienda-filtros">
        {["Todos", "Producto", "Servicio"].map(t => (
          <button
            key={t}
            className={`filtro-btn ${filtroTipo === t ? "active" : ""}`}
            onClick={() => setFiltroTipo(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div className="tienda-empty">
          <p>Esta tienda no tiene productos visibles.</p>
        </div>
      ) : (
        <div className="tienda-grid">
          {filtrados.map((p) => (
            <div key={p.id_producto} className="tienda-card">
              <div className="tienda-card-img">
                {p.imagen
                  ? <img src={p.imagen} alt={p.nombre_producto} />
                  : <div className="tienda-card-placeholder">📦</div>
                }
                <span className={`tienda-badge ${p.tipo}`}>
                  {p.tipo === "producto" ? "Producto" : "Servicio"}
                </span>
              </div>
              <div className="tienda-card-body">
                <h3>{p.nombre_producto}</h3>
                <p className="tienda-categoria">{p.categoria}</p>
                {p.descripcion && <p className="tienda-desc">{p.descripcion}</p>}
                {p.tipo === "servicio" && p.duracion && (
                  <span className="tienda-duracion">⏱ {p.duracion}</span>
                )}
                <div className="tienda-precio">
                  ${Number(p.precio).toLocaleString("es-CO")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}