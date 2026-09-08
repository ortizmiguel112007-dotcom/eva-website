import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import { FiHeart, FiTrash2, FiArrowRight } from "react-icons/fi"

import { useProductoAcciones } from "@/features/tienda/hooks/useProductoAcciones"
import { useApiData } from "@/features/usuario/hooks/useApiData"
import { FavoritoCard } from "../components/favoritos/FavoritoCard"

import "@/infrastructure/css/usuario/favoritos/MisFavoritos.css"

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function MisFavoritos() {
  const navigate  = useNavigate()
  const { token } = useAuth()
  const acciones  = useProductoAcciones()
  const { data: productos, cargando, setData: setProductos } = useApiData("/api/favoritos", token)

  const eliminarFavorito = async (id) => {
    try {
      await axios.post(`${BASE}/api/favoritos/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setProductos(prev => prev.filter(p => p.id_producto !== id))
    } catch {}
  }

  const limpiarTodos = async () => {
    try {
      await Promise.all(
        productos.map(p =>
          axios.post(`${BASE}/api/favoritos/${p.id_producto}`, {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      )
      setProductos([])
    } catch {}
  }

  if (cargando) return (
    <div className="fav-loading">
      <div className="fav-spinner" />
      <p>Cargando favoritos...</p>
    </div>
  )

  return (
    <div className="fav-page">
      <div className="fav-header">
        <div className="fav-header-left">
          <div className="fav-header-icono">
            <FiHeart size={22} color="#ef4444" fill="#ef4444" />
          </div>
          <div>
            <h1 className="fav-titulo">Mis Favoritos</h1>
            <p className="fav-sub">
              {productos.length > 0
                ? `${productos.length} producto${productos.length !== 1 ? "s" : ""} guardado${productos.length !== 1 ? "s" : ""}`
                : "No tienes favoritos aún"}
            </p>
          </div>
        </div>
        {productos.length > 0 && (
          <button className="fav-btn-limpiar" onClick={limpiarTodos}>
            <FiTrash2 size={13} /> Limpiar todo
          </button>
        )}
      </div>

      {productos.length === 0 ? (
        <div className="fav-empty">
          <div className="fav-empty-icono">
            <FiHeart size={40} color="#fca5a5" />
          </div>
          <h3>Tu lista está vacía</h3>
          <p>Guarda tus productos favoritos para encontrarlos fácilmente</p>
          <button className="fav-btn-explorar" onClick={() => navigate("/productos")}>
            <FiArrowRight size={14} /> Explorar productos
          </button>
        </div>
      ) : (
        <div className="fav-grid">
          {productos.map((p, idx) => (
            <FavoritoCard
              key={p.id_producto}
              producto={p}
              idx={idx}
              onNavigate={id => navigate(`/producto/${id}`)}
              onEliminar={eliminarFavorito}
              onAgregar={acciones.handleAgregar}
              yaAgregado={acciones.yaAgregado(p.id_producto)}
            />
          ))}
        </div>
      )}
    </div>
  )
}