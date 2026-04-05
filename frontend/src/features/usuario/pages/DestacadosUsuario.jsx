import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCarrito } from "@/core/context/CarritoContext"
import { tiendaService } from "@/features/tienda/services/tienda.service"
import {
  FiShoppingCart, FiHeart, FiPackage,
  FiStar, FiZap, FiFilter
} from "react-icons/fi"
import "@/infrastructure/css/DestacadosUsuario.css"

function formatPrecio(p) { return "$" + Number(p).toLocaleString("es-CO") }

const CATEGORIAS = ["Todos", "alimentacion", "moda", "hogar", "belleza", "artesanias", "tecnologia", "educacion"]

export default function DestacadosUsuario() {
  const navigate = useNavigate()
  const { agregarAlCarrito } = useCarrito()

  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [agregados, setAgregados] = useState({})
  const [favoritos, setFavoritos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("favoritos") || "[]") } catch { return [] }
  })
  const [catActiva, setCatActiva] = useState("Todos")
  const [hover, setHover]         = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await tiendaService.getDestacados()
        setProductos(Array.isArray(data) ? data : [])
      } catch { setProductos([]) }
      finally { setCargando(false) }
    }
    cargar()
  }, [])

  const handleAgregar = (e, p) => {
    e.stopPropagation()
    agregarAlCarrito({
      id_producto: p.id_producto, nombre_producto: p.nombre_producto,
      precio: p.precio, imagen: p.imagen, categoria: p.categoria,
    })
    setAgregados(prev => ({ ...prev, [p.id_producto]: true }))
    setTimeout(() => setAgregados(prev => ({ ...prev, [p.id_producto]: false })), 2000)
  }

  const toggleFav = (e, id) => {
    e.stopPropagation()
    setFavoritos(prev => {
      const nuevo = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem("favoritos", JSON.stringify(nuevo))
      return nuevo
    })
  }

  const categoriasPresentes = ["Todos", ...new Set(productos.map(p => p.categoria).filter(Boolean))]

  const filtrados = catActiva === "Todos"
    ? productos
    : productos.filter(p => p.categoria?.toLowerCase() === catActiva.toLowerCase())

  if (cargando) return (
    <div className="du-loading">
      <div className="du-spinner" />
      <p>Cargando destacados...</p>
    </div>
  )

  return (
    <div className="du-page">

      {/* Hero banner */}
      <div className="du-hero">
        <div className="du-hero-blur du-blur-1" />
        <div className="du-hero-blur du-blur-2" />
        <div className="du-hero-content">
          <div className="du-hero-badge">
            <FiZap size={12} /> Selección especial
          </div>
          <h1 className="du-hero-titulo">Ofertas &amp; Destacados</h1>
          <p className="du-hero-sub">
            Productos seleccionados por nuestras emprendedoras —
            <strong> {productos.length}</strong> disponibles
          </p>
        </div>
        <div className="du-hero-stars">
          {[...Array(6)].map((_, i) => (
            <FiStar key={i} className="du-star-deco" size={i % 2 === 0 ? 16 : 10}
              fill="#f59e0b" color="#f59e0b"
              style={{ animationDelay: `${i * 0.4}s`, top: `${15 + i * 12}%`, right: `${8 + i * 6}%` }} />
          ))}
        </div>
      </div>

      {/* Filtros categoría */}
      {categoriasPresentes.length > 1 && (
        <div className="du-filtros">
          <FiFilter size={13} color="#94a3b8" />
          {categoriasPresentes.map(cat => (
            <button key={cat}
              className={`du-filtro-btn ${catActiva === cat ? "active" : ""}`}
              onClick={() => setCatActiva(cat)}>
              {cat === "Todos" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div className="du-empty">
          <FiStar size={48} color="#e5e7eb" />
          <p>No hay productos en esta categoría</p>
        </div>
      ) : (
        <div className="du-grid">
          {filtrados.map((p, idx) => {
            const agotado    = p.inventario?.cantidad === 0
            const yaAgregado = agregados[p.id_producto]
            const esFav      = favoritos.includes(p.id_producto)
            const isHover    = hover === p.id_producto
            const delay      = `${(idx % 6) * 0.05}s`

            return (
              <div key={p.id_producto}
                className={`du-card ${agotado ? "agotado" : ""}`}
                style={{ animationDelay: delay }}
                onMouseEnter={() => setHover(p.id_producto)}
                onMouseLeave={() => setHover(null)}
                onClick={() => navigate(`/producto/${p.id_producto}`)}>

                {/* Imagen */}
                <div className="du-card-img">
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre_producto}
                        style={{ transform: isHover ? "scale(1.06)" : "scale(1)" }} />
                    : <div className="du-no-img"><FiPackage size={36} color="#cbd5e1" /></div>
                  }

                  {/* Badges */}
                  <div className="du-card-badges">
                    <span className="du-badge-dest">
                      <FiStar size={10} fill="#fff" color="#fff" /> Destacado
                    </span>
                    {p.tipo && <span className="du-badge-tipo">{p.tipo}</span>}
                  </div>

                  {/* Favorito */}
                  <button className={`du-fav-btn ${esFav ? "active" : ""}`}
                    onClick={e => toggleFav(e, p.id_producto)}>
                    <FiHeart size={14}
                      fill={esFav ? "#ef4444" : "none"}
                      color={esFav ? "#ef4444" : "#94a3b8"} />
                  </button>

                  {/* Overlay agotado */}
                  {agotado && (
                    <div className="du-agotado-overlay">
                      <span>Agotado</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="du-card-body">
                  <span className="du-card-cat">{p.categoria}</span>
                  <h3 className="du-card-nombre">{p.nombre_producto}</h3>

                  {p.descripcion && (
                    <p className="du-card-desc">{p.descripcion}</p>
                  )}

                  <span className="du-card-tienda">
                    {p.seccion?.emprendedora?.usuario?.nombre || "EVA"}
                  </span>

                  <div className="du-card-footer">
                    <span className="du-card-precio">{formatPrecio(p.precio)}</span>
                    <button
                      disabled={agotado}
                      onClick={e => handleAgregar(e, p)}
                      className={`du-btn-agregar ${yaAgregado ? "agregado" : ""} ${agotado ? "agotado" : ""}`}>
                      <FiShoppingCart size={13} />
                      {yaAgregado ? "✓" : agotado ? "Agotado" : "Agregar"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}