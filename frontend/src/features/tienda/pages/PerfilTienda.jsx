import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { tiendaService } from "../services/tienda.service"
import { useCarrito } from "@/core/context/CarritoContext"
import {
  FiPackage, FiClock, FiShoppingCart, FiStar,
  FiArrowLeft, FiGrid, FiList, FiHeart, FiCheck
} from "react-icons/fi"
import "@/infrastructure/css/PerfilTienda.css"

function formatPrecio(p) { return "$" + Number(p).toLocaleString("es-CO") }

const AVATAR_COLORS = [
  ["#3b82f6","#1d4ed8"], ["#059669","#047857"], ["#d97706","#b45309"],
  ["#7c3aed","#5b21b6"], ["#ef4444","#dc2626"], ["#0891b2","#0e7490"],
]

function getAvatarGradient(nombre) {
  if (!nombre) return AVATAR_COLORS[0]
  const sum = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function getInitials(nombre) {
  if (!nombre) return "?"
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}

export default function PerfilTienda() {
  const { id_emprendedora } = useParams()
  const navigate = useNavigate()
  const { agregarAlCarrito } = useCarrito()

  const [productos, setProductos]   = useState([])
  const [cargando, setCargando]     = useState(true)
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [vista, setVista]           = useState("grid")
  const [agregados, setAgregados]   = useState({})
  const [favoritos, setFavoritos]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("favoritos") || "[]") } catch { return [] }
  })

  // Obtener nombre de la emprendedora del primer producto
  const nombreTienda = productos[0]?.seccion?.emprendedora?.usuario?.nombre || "Tienda"
  const [c1, c2] = getAvatarGradient(nombreTienda)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await tiendaService.obtenerProductos(id_emprendedora)
        setProductos(data)
      } catch (err) { console.error(err) }
      finally { setCargando(false) }
    }
    cargar()
  }, [id_emprendedora])

  const filtrados = productos.filter(p =>
    filtroTipo === "todos" || p.tipo === filtroTipo
  )

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

  const nProductos  = productos.filter(p => p.tipo === "producto").length
  const nServicios  = productos.filter(p => p.tipo === "servicio").length
  const precioMin   = productos.length ? formatPrecio(Math.min(...productos.map(p => Number(p.precio)))) : null

  if (cargando) return (
    <div className="pt-loading">
      <div className="pt-spinner" />
      <p>Cargando tienda...</p>
    </div>
  )

  return (
    <div className="pt-page">

      {/* ── Hero banner ── */}
      <div className="pt-hero">
        <div className="pt-hero-bg" />
        <div className="pt-hero-blur pt-blur-1" />
        <div className="pt-hero-blur pt-blur-2" />

        {/* Botón volver */}
        <button className="pt-btn-volver" onClick={() => navigate("/tiendas")}>
          <FiArrowLeft size={15} /> Tiendas
        </button>

        <div className="pt-hero-content">
          {/* Avatar grande */}
          <div className="pt-avatar-wrap">
            <div className="pt-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
              {getInitials(nombreTienda)}
            </div>
          </div>

          <div className="pt-hero-info">
            <h1 className="pt-hero-nombre">{nombreTienda}</h1>
            <p className="pt-hero-sub">Emprendedora EVA</p>

            {/* Stats */}
            <div className="pt-hero-stats">
              <div className="pt-stat">
                <strong>{productos.length}</strong>
                <span>Total</span>
              </div>
              <div className="pt-stat-div" />
              <div className="pt-stat">
                <strong>{nProductos}</strong>
                <span>Productos</span>
              </div>
              <div className="pt-stat-div" />
              <div className="pt-stat">
                <strong>{nServicios}</strong>
                <span>Servicios</span>
              </div>
              {precioMin && (
                <>
                  <div className="pt-stat-div" />
                  <div className="pt-stat">
                    <strong>{precioMin}</strong>
                    <span>Desde</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="pt-toolbar">
        {/* Filtros tipo */}
        <div className="pt-filtros">
          {[
            { key: "todos",    label: "Todos",     count: productos.length },
            { key: "producto", label: "Productos",  count: nProductos },
            { key: "servicio", label: "Servicios",  count: nServicios },
          ].map(f => (
            <button key={f.key}
              className={`pt-filtro-btn ${filtroTipo === f.key ? "active" : ""}`}
              onClick={() => setFiltroTipo(f.key)}>
              {f.label}
              <span className="pt-filtro-count">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Vista toggle */}
        <div className="pt-vista-toggle">
          <button className={`pt-vista-btn ${vista === "grid" ? "active" : ""}`}
            onClick={() => setVista("grid")}>
            <FiGrid size={15} />
          </button>
          <button className={`pt-vista-btn ${vista === "list" ? "active" : ""}`}
            onClick={() => setVista("list")}>
            <FiList size={15} />
          </button>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="pt-contenido">
        {filtrados.length === 0 ? (
          <div className="pt-empty">
            <FiPackage size={48} color="#cbd5e1" />
            <h3>Sin productos en esta categoría</h3>
            <p>Prueba con otro filtro</p>
          </div>
        ) : vista === "grid" ? (
          <div className="pt-grid">
            {filtrados.map((p, idx) => {
              const yaAgregado = agregados[p.id_producto]
              const esFav      = favoritos.includes(p.id_producto)
              return (
                <div key={p.id_producto} className="pt-card"
                  style={{ animationDelay: `${idx * 0.04}s` }}>

                  {/* Imagen */}
                  <div className="pt-card-img">
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre_producto} />
                      : <div className="pt-card-no-img"><FiPackage size={36} color="#cbd5e1" /></div>
                    }
                    <span className={`pt-badge pt-badge--${p.tipo}`}>
                      {p.tipo === "producto" ? "Producto" : "Servicio"}
                    </span>
                    <button className={`pt-fav-btn ${esFav ? "active" : ""}`}
                      onClick={e => toggleFav(e, p.id_producto)}>
                      <FiHeart size={13} fill={esFav ? "#ef4444" : "none"} color={esFav ? "#ef4444" : "#94a3b8"} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="pt-card-body">
                    <span className="pt-card-cat">{p.categoria}</span>
                    <h3 className="pt-card-nombre">{p.nombre_producto}</h3>
                    {p.descripcion && <p className="pt-card-desc">{p.descripcion}</p>}
                    {p.tipo === "servicio" && p.duracion && (
                      <div className="pt-card-duracion">
                        <FiClock size={11} /> {p.duracion}
                      </div>
                    )}
                    <div className="pt-card-footer">
                      <span className="pt-card-precio">{formatPrecio(p.precio)}</span>
                      <button
                        className={`pt-btn-agregar ${yaAgregado ? "agregado" : ""}`}
                        onClick={e => handleAgregar(e, p)}>
                        {yaAgregado
                          ? <><FiCheck size={13} /> Listo</>
                          : <><FiShoppingCart size={13} /> Agregar</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Vista lista */
          <div className="pt-lista">
            {filtrados.map((p, idx) => {
              const yaAgregado = agregados[p.id_producto]
              const esFav      = favoritos.includes(p.id_producto)
              return (
                <div key={p.id_producto} className="pt-list-item"
                  style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div className="pt-list-img">
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre_producto} />
                      : <div className="pt-list-no-img"><FiPackage size={24} color="#cbd5e1" /></div>
                    }
                  </div>
                  <div className="pt-list-info">
                    <div className="pt-list-top">
                      <span className={`pt-badge pt-badge--${p.tipo}`}>{p.tipo}</span>
                      <span className="pt-list-cat">{p.categoria}</span>
                    </div>
                    <h3 className="pt-list-nombre">{p.nombre_producto}</h3>
                    {p.descripcion && <p className="pt-list-desc">{p.descripcion}</p>}
                    {p.tipo === "servicio" && p.duracion && (
                      <div className="pt-card-duracion"><FiClock size={11} /> {p.duracion}</div>
                    )}
                  </div>
                  <div className="pt-list-acciones">
                    <span className="pt-list-precio">{formatPrecio(p.precio)}</span>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button className={`pt-fav-btn ${esFav ? "active" : ""}`}
                        onClick={e => toggleFav(e, p.id_producto)}>
                        <FiHeart size={13} fill={esFav ? "#ef4444" : "none"} color={esFav ? "#ef4444" : "#94a3b8"} />
                      </button>
                      <button
                        className={`pt-btn-agregar ${yaAgregado ? "agregado" : ""}`}
                        onClick={e => handleAgregar(e, p)}>
                        {yaAgregado ? <FiCheck size={13} /> : <FiShoppingCart size={13} />}
                        {yaAgregado ? "Listo" : "Agregar"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}