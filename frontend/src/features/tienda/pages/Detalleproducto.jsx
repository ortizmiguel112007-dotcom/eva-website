import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { tiendaService } from "../services/tienda.service"
import { useCarrito } from "@/core/context/CarritoContext"
import {
  FiShoppingCart, FiMinus, FiPlus, FiStar,
  FiArrowLeft, FiHeart, FiPackage, FiMessageSquare,
  FiClock, FiTag, FiCheck, FiAlertCircle, FiLogIn
} from "react-icons/fi"
import "@/infrastructure/css/DetalleProductoUsuario.css"

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

function formatPrecio(p) { return "$" + Number(p).toLocaleString("es-CO") }
function formatFecha(f) {
  return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

function Estrellas({ cal, size = 15 }) {
  return (
    <div className="dp-estrellas">
      {[1,2,3,4,5].map(i => (
        <FiStar key={i} size={size}
          fill={i <= cal ? "#f59e0b" : "none"}
          color={i <= cal ? "#f59e0b" : "#d1d5db"} />
      ))}
    </div>
  )
}

export default function DetalleProducto() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { agregarAlCarrito } = useCarrito()

  const [producto, setProducto]         = useState(null)
  const [relacionados, setRelacionados] = useState([])
  const [comentarios, setComentarios]   = useState([])
  const [cargando, setCargando]         = useState(true)
  const [cantidad, setCantidad]         = useState(1)
  const [toast, setToast]               = useState(null)
  const [favorito, setFavorito]         = useState(false)
  const [agregado, setAgregado]         = useState(false)

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]")
    setFavorito(favs.includes(Number(id)))
  }, [id])

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      try {
        const data = await tiendaService.getProducto(id)
        setProducto(data)
        if (data.categoria) {
          const todos = await tiendaService.getCatalogo({ categoria: data.categoria?.toLowerCase() })
          setRelacionados(todos.filter(p => p.id_producto !== data.id_producto).slice(0, 4))
        }
        try {
          const coms = await tiendaService.getComentariosProducto(id)
          setComentarios(coms)
        } catch { setComentarios([]) }
      } catch (err) { console.error(err) }
      finally { setCargando(false) }
    }
    cargar()
    window.scrollTo(0, 0)
  }, [id])

  const handleAgregar = () => {
    if (!producto) return
    agregarAlCarrito({
      id_producto: producto.id_producto, nombre_producto: producto.nombre_producto,
      precio: producto.precio, imagen: producto.imagen, categoria: producto.categoria,
    }, cantidad)
    setAgregado(true)
    mostrarToast(`${producto.nombre_producto} agregado al carrito`)
    setTimeout(() => setAgregado(false), 2000)
  }

  const handleFavorito = () => {
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]")
    const nuevo = favorito ? favs.filter(f => f !== Number(id)) : [...favs, Number(id)]
    localStorage.setItem("favoritos", JSON.stringify(nuevo))
    setFavorito(!favorito)
  }

  if (cargando) return (
    <div className="dp-loading">
      <div className="dp-spinner" />
      <p>Cargando producto...</p>
    </div>
  )

  if (!producto) return (
    <div className="dp-loading">
      <FiPackage size={48} color="#cbd5e1" />
      <p>Producto no encontrado</p>
    </div>
  )

  const stock       = producto.inventario?.cantidad ?? 0
  const stockMin    = producto.inventario?.stock_minimo ?? 0
  const estadoStock = stock === 0 ? "agotado" : stock <= stockMin ? "bajo" : "ok"
  const stockLabel  = stock === 0 ? "Agotado" : stock <= stockMin ? `Stock bajo (${stock})` : `${stock} disponibles`

  const emprendedora   = producto.seccion?.emprendedora
  const nombreTienda   = emprendedora?.usuario?.nombre || "EVA"
  const idEmprendedora = emprendedora?.id_emprendedora
  const [c1, c2]       = getAvatarGradient(nombreTienda)

  const promedio = comentarios.length
    ? (comentarios.reduce((acc, c) => acc + c.calificacion, 0) / comentarios.length).toFixed(1)
    : null

  return (
    <div className="dp-page">

      {/* Toast */}
      {toast && (
        <div className={`dp-toast dp-toast--${toast.tipo}`}>
          {toast.tipo === "ok" ? <FiCheck size={14} /> : <FiAlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="dp-breadcrumb">
        <button className="dp-btn-volver" onClick={() => navigate("/")}>
          <FiArrowLeft size={14} /> Inicio
        </button>
        <span className="dp-breadcrumb-sep">›</span>
        <button className="dp-btn-volver" onClick={() => navigate("/catalogo")}>
          Catálogo
        </button>
        <span className="dp-breadcrumb-sep">›</span>
        <span className="dp-breadcrumb-actual">{producto.nombre_producto}</span>
      </div>

      {/* ── Layout principal ── */}
      <div className="dp-main">

        {/* Imagen */}
        <div className="dp-col-img">
          <div className="dp-img-principal">
            {producto.imagen
              ? <img src={producto.imagen} alt={producto.nombre_producto} />
              : <div className="dp-img-placeholder"><FiPackage size={64} color="#cbd5e1" /></div>
            }
            <span className={`dp-badge dp-badge--${producto.tipo}`}>{producto.tipo}</span>
            <button className={`dp-fav-btn ${favorito ? "active" : ""}`} onClick={handleFavorito}>
              <FiHeart size={16} fill={favorito ? "#ef4444" : "none"} color={favorito ? "#ef4444" : "#94a3b8"} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="dp-col-info">
          <div className="dp-cat-row">
            <FiTag size={12} /> <span>{producto.categoria}</span>
          </div>

          <h1 className="dp-nombre">{producto.nombre_producto}</h1>

          {promedio && (
            <div className="dp-rating">
              <Estrellas cal={Math.round(Number(promedio))} />
              <span className="dp-rating-num">{promedio}</span>
              <span className="dp-rating-count">({comentarios.length} reseñas)</span>
            </div>
          )}

          <div className="dp-precio">{formatPrecio(producto.precio)}</div>

          {producto.descripcion && (
            <p className="dp-descripcion">{producto.descripcion}</p>
          )}

          {producto.tipo === "servicio" && producto.duracion && (
            <div className="dp-duracion">
              <FiClock size={14} /> {producto.duracion}
            </div>
          )}

          <div className={`dp-stock dp-stock--${estadoStock}`}>
            <div className="dp-stock-dot" /> {stockLabel}
          </div>

          <div className="dp-acciones">
            {producto.tipo === "producto" && (
              <div className="dp-cantidad">
                <button onClick={() => setCantidad(p => Math.max(1, p - 1))}><FiMinus size={13} /></button>
                <span>{cantidad}</span>
                <button onClick={() => setCantidad(p => Math.min(stock || 99, p + 1))}><FiPlus size={13} /></button>
              </div>
            )}
            <button
              className={`dp-btn-agregar ${agregado ? "agregado" : ""} ${estadoStock === "agotado" ? "agotado" : ""}`}
              onClick={handleAgregar}
              disabled={estadoStock === "agotado"}>
              {agregado
                ? <><FiCheck size={16} /> ¡Agregado!</>
                : estadoStock === "agotado"
                  ? "Agotado"
                  : <><FiShoppingCart size={16} /> Agregar al carrito</>
              }
            </button>
          </div>

          {/* Card tienda */}
          <div className="dp-tienda-card">
            <div className="dp-tienda-left">
              <div className="dp-tienda-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                {getInitials(nombreTienda)}
              </div>
              <div>
                <p className="dp-tienda-nombre">{nombreTienda}</p>
                <span className="dp-tienda-sub">Emprendedora EVA</span>
              </div>
            </div>
            {idEmprendedora && (
              <button className="dp-btn-ver-tienda"
                onClick={() => navigate(`/tienda/${idEmprendedora}`)}>
                Ver tienda →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Comentarios ── */}
      <div className="dp-seccion">
        <div className="dp-seccion-header">
          <h2 className="dp-seccion-titulo">
            <FiStar size={18} color="#f59e0b" /> Reseñas y Calificaciones
          </h2>
          {/* Invitar a iniciar sesión para reseñar */}
          <button className="dp-btn-resena" onClick={() => navigate("/login")}>
            <FiLogIn size={14} /> Inicia sesión para reseñar
          </button>
        </div>

        {promedio && (
          <div className="dp-promedio">
            <span className="dp-promedio-num">{promedio}</span>
            <div>
              <Estrellas cal={Math.round(Number(promedio))} size={18} />
              <span className="dp-promedio-count">{comentarios.length} reseñas</span>
            </div>
          </div>
        )}

        {comentarios.length === 0 ? (
          <div className="dp-sin-comentarios">
            <FiMessageSquare size={36} color="#cbd5e1" />
            <p>Aún no hay reseñas</p>
            <span>Inicia sesión y compra para comentar</span>
          </div>
        ) : (
          <div className="dp-comentarios-lista">
            {comentarios.map(c => {
              const [ca, cb] = getAvatarGradient(c.usuario?.nombre)
              return (
                <div key={c.id_comentario} className="dp-comentario">
                  <div className="dp-comentario-header">
                    <div className="dp-comentario-usuario">
                      <div className="dp-comentario-avatar"
                        style={{ background: `linear-gradient(135deg, ${ca}, ${cb})` }}>
                        {getInitials(c.usuario?.nombre)}
                      </div>
                      <div>
                        <p className="dp-comentario-nombre">{c.usuario?.nombre}</p>
                        <Estrellas cal={c.calificacion} size={12} />
                      </div>
                    </div>
                    <span className="dp-comentario-fecha">{formatFecha(c.fecha)}</span>
                  </div>
                  <p className="dp-comentario-texto">"{c.texto}"</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Relacionados ── */}
      {relacionados.length > 0 && (
        <div className="dp-seccion">
          <div className="dp-seccion-header">
            <h2 className="dp-seccion-titulo">
              <FiPackage size={18} /> Productos Relacionados
            </h2>
          </div>
          <div className="dp-relacionados-grid">
            {relacionados.map(p => (
              <div key={p.id_producto} className="dp-rel-card"
                onClick={() => navigate(`/producto/${p.id_producto}`)}>
                <div className="dp-rel-img">
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre_producto} />
                    : <div className="dp-rel-no-img"><FiPackage size={28} color="#cbd5e1" /></div>
                  }
                  <span className={`dp-badge dp-badge--${p.tipo}`}>{p.tipo}</span>
                </div>
                <div className="dp-rel-body">
                  <span className="dp-rel-cat">{p.categoria}</span>
                  <h4 className="dp-rel-nombre">{p.nombre_producto}</h4>
                  <div className="dp-rel-footer">
                    <span className="dp-rel-precio">{formatPrecio(p.precio)}</span>
                    <button className="dp-rel-btn"
                      onClick={e => {
                        e.stopPropagation()
                        agregarAlCarrito({
                          id_producto: p.id_producto, nombre_producto: p.nombre_producto,
                          precio: p.precio, imagen: p.imagen, categoria: p.categoria
                        })
                        mostrarToast(`${p.nombre_producto} agregado`)
                      }}>
                      <FiShoppingCart size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
