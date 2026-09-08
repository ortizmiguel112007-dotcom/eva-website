import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import { FiHeart, FiShoppingBag } from "react-icons/fi"

import { MetricasFavoritos }    from "../components/favoritos/MetricasFavoritos"
import { FavoritoTiendaCard }   from "../components/favoritos/FavoritoTiendaCard"

import "@/infrastructure/css/products-emprend/favoritos_tiendas/FavoritosTienda.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function FavoritosTienda() {
  const { token } = useAuth()
  const navigate  = useNavigate()

  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [orden, setOrden]         = useState("favoritos")

  useEffect(() => {
    axios.get(`${BASE}/api/favoritos/tienda`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProductos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false))
  }, [token])

  const ordenados = [...productos].sort((a, b) => {
    if (orden === "favoritos")    return b.total_favoritos - a.total_favoritos
    if (orden === "precio_asc")   return Number(a.precio) - Number(b.precio)
    if (orden === "precio_desc")  return Number(b.precio) - Number(a.precio)
    return 0
  })

  if (cargando) return (
    <div className="ft-loading">
      <div className="ft-spinner" />
      <p>Cargando favoritos...</p>
    </div>
  )

  return (
    <div className="ft-page">
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

      <MetricasFavoritos productos={productos} />

      {productos.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-empty-icono">
            <FiHeart size={40} color="#fca5a5" />
          </div>
          <h3>Aún sin favoritos</h3>
          <p>Cuando los clientes marquen tus productos como favoritos aparecerán aquí</p>
          <button className="ft-btn-ver" onClick={() => navigate("/dashboard")}>
            <FiShoppingBag size={14} /> Ver mis productos
          </button>
        </div>
      ) : (
        <>
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

          <div className="ft-grid">
            {ordenados.map((p, idx) => (
              <FavoritoTiendaCard
                key={p.id_producto}
                producto={p}
                idx={idx}
                onNavigate={id => navigate(`/tienda/${id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}