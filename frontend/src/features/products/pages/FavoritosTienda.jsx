import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import {
  FiHeart, FiPackage, FiTag, FiStar,
  FiTrendingUp, FiShoppingBag, FiArrowRight
} from "react-icons/fi"
import "@/infrastructure/css/FavoritosTienda.css"

const BASE = "http://localhost:3000"

function formatPrecio(p) { return "$" + Number(p).toLocaleString("es-CO") }

function Estrellas({ val }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <FiStar key={i} size={11}
          fill={i <= Math.round(val) ? "#f59e0b" : "none"}
          color={i <= Math.round(val) ? "#f59e0b" : "#d1d5db"} />
      ))}
    </div>
  )
}

export default function FavoritosTienda() {
  const { token } = useAuth()
  const navigate  = useNavigate()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [orden, setOrden]         = useState("favoritos")

  useEffect(() => { cargar() }, [token])

  const cargar = async () => {
    try {
      const res = await axios.get(`${BASE}/api/favoritos/tienda`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProductos(Array.isArray(res.data) ? res.data : [])
    } catch { setProductos([]) }
    finally { setCargando(false) }
  }

  const ordenados = [...productos].sort((a, b) => {
    if (orden === "favoritos") return b.total_favoritos - a.total_favoritos
    if (orden === "precio_asc") return Number(a.precio) - Number(b.precio)
    if (orden === "precio_desc") return Number(b.precio) - Number(a.precio)
    return 0
  })

  const totalFavoritos = productos.reduce((acc, p) => acc + (p.total_favoritos || 0), 0)
  const masPopular = productos.reduce((max, p) => 
    (p.total_favoritos || 0) > (max?.total_favoritos || 0) ? p : max, null)

  if (cargando) return (
    <div className="ft-loading">
      <div className="ft-spinner" />
      <p>Cargando favoritos...</p>
    </div>
  )

  return (
    <div className="ft-page">

      {/* Header */}
      <div className="ft-header">
        <div className="ft-header-left">
          <div className="ft-header-icono">
            <FiHeart size={22} color="#ef4444" fill="#ef4444" />
          </div>
          <div>
            <h1 className="ft-titulo">Productos Favoritos</h1>
            <p className="ft-sub">Lo que más les gusta a tus clientes</p>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="ft-metricas">
        <div className="ft-metrica">
          <div className="ft-metrica-icono" style={{ background: "#fff1f2" }}>
            <FiHeart size={16} color="#ef4444" fill="#ef4444" />
          </div>
          <div>
            <p className="ft-metrica-label">Total favoritos</p>
            <strong className="ft-metrica-valor" style={{ color: "#ef4444" }}>
              {totalFavoritos}
            </strong>
          </div>
        </div>
        <div className="ft-metrica">
          <div className="ft-metrica-icono" style={{ background: "#eff6ff" }}>
            <FiPackage size={16} color="#3b82f6" />
          </div>
          <div>
            <p className="ft-metrica-label">Productos guardados</p>
            <strong className="ft-metrica-valor" style={{ color: "#3b82f6" }}>
              {productos.length}
            </strong>
          </div>
        </div>
        {masPopular && (
          <div className="ft-metrica ft-metrica--wide">
            <div className="ft-metrica-icono" style={{ background: "#fffbeb" }}>
              <FiTrendingUp size={16} color="#f59e0b" />
            </div>
            <div>
              <p className="ft-metrica-label">Más popular</p>
              <strong className="ft-metrica-valor" style={{ color: "#f59e0b", fontSize: "0.88rem" }}>
                {masPopular.nombre_producto}
              </strong>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                {masPopular.total_favoritos} ♥
              </span>
            </div>
          </div>
        )}
      </div>

      {productos.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-empty-icono">
            <FiHeart size={40} color="#fca5a5" />
          </div>
          <h3>Aún sin favoritos</h3>
          <p>Cuando los clientes marquen tus productos como favoritos aparecerán aquí</p>
          <button className="ft-btn-ver" onClick={() => navigate(`/dashboard`)}>
            <FiShoppingBag size={14} /> Ver mis productos
          </button>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="ft-toolbar">
            <span className="ft-toolbar-count">
              <strong>{productos.length}</strong> productos con favoritos
            </span>
            <select className="ft-ordenar" value={orden} onChange={e => setOrden(e.target.value)}>
              <option value="favoritos">Más favoritos</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
            </select>
          </div>

          {/* Grid */}
          <div className="ft-grid">
            {ordenados.map((p, idx) => {
              const agotado = p.tipo !== "servicio" && p.inventario?.cantidad === 0
              const promedio = p.comentarios?.length
                ? (p.comentarios.reduce((acc, c) => acc + c.calificacion, 0) / p.comentarios.length)
                : null

              return (
                <div key={p.id_producto}
                  className="ft-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => navigate(`/tienda/${p.id_seccion}`)}>

                  {/* Badge favoritos */}
                  <div className="ft-fav-badge">
                    <FiHeart size={11} fill="#ef4444" color="#ef4444" />
                    {p.total_favoritos}
                  </div>

                  {/* Imagen */}
                  <div className="ft-card-img">
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre_producto} />
                      : <div className="ft-no-img"><FiPackage size={32} color="#cbd5e1" /></div>
                    }
                    <span className={`ft-tipo ft-tipo--${p.tipo}`}>{p.tipo}</span>
                    {agotado && <div className="ft-agotado">Agotado</div>}
                  </div>

                  {/* Body */}
                  <div className="ft-card-body">
                    <span className="ft-cat">{p.categoria}</span>
                    <h3 className="ft-nombre">{p.nombre_producto}</h3>

                    {promedio && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                        <Estrellas val={promedio} />
                        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                          {promedio.toFixed(1)}
                        </span>
                      </div>
                    )}

                    <div className="ft-card-footer">
                      <strong className="ft-precio">{formatPrecio(p.precio)}</strong>
                      <div className="ft-stock" style={{
                        color: agotado ? "#ef4444" : p.inventario?.cantidad <= (p.inventario?.stock_minimo || 0) ? "#f59e0b" : "#16a34a"
                      }}>
                        {agotado ? "Sin stock" : `${p.inventario?.cantidad ?? 0} uds`}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}