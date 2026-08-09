import { useNavigate } from "react-router-dom"
import { useAuth } from "@/core/context/AuthConten"
import { useCarrito } from "@/core/context/CarritoContext"
import { FiArrowRight } from "react-icons/fi"

// ── De tienda directamente ──────────────────────────
import { useCatalogo } from "@/features/tienda/hooks/catalogo/useCatalogo"
import { useFiltrosCatalogo } from "@/features/tienda/hooks/catalogo/useFiltrosCatalogo"
import { useProductosFiltrados } from "@/features/tienda/hooks/catalogo/useProductosFiltrados"
import { tiendaService } from "@/features/tienda/services/tienda.service"

// ── Propios de usuario ──────────────────────────────
import { useDashboard } from "../hooks/useDashboard"
import { MetricasGrid } from "../components/dashboard/MetricasGrid"
import { ProductoCard } from "../components/dashboard/ProductoCard"
import { PedidosRecientes } from "../components/dashboard/PedidosRecientes"
import { DashboardFooter } from "../components/dashboard/DashboardFooter"
import { SeccionDashboard } from "../components/dashboard/SeccionDashboard"

import "@/infrastructure/css/usuario/dashboard/UsuarioDashboard.css"

export default function UsuarioDashboard() {
  const { user, token } = useAuth()
  const { agregarAlCarrito } = useCarrito()
  const navigate = useNavigate()

  const { destacados, pedidos, totalFavoritos, cargando,
          activos, enCamino, completados } = useDashboard(token)

  const catalogo  = useCatalogo(tiendaService.getCatalogo)
  const filtros   = useFiltrosCatalogo(catalogo.precioMax)
  const filtrados = useProductosFiltrados({ catalogo, filtros })

  const handleAgregar = (p) =>
    agregarAlCarrito({
      id_producto:     p.id_producto,
      nombre_producto: p.nombre_producto,
      precio:          p.precio,
      imagen:          p.imagen,
      categoria:       p.categoria,
    })

  if (cargando) return <div className="ud-loading">Cargando...</div>

  return (
    <div className="ud-container">

      {/* Bienvenida */}
      <div className="ud-welcome">
        <h1>Bienvenid@, {user?.nombre} 👋</h1>
        <p>Explora productos y servicios de nuestras emprendedoras</p>
      </div>

      {/* Métricas */}
      <MetricasGrid
        activos={activos}
        enCamino={enCamino}
        completados={completados}
        totalFavoritos={totalFavoritos}
      />

      {/* Destacados */}
      {destacados.length > 0 && (
        <SeccionDashboard titulo="Productos destacados" onVerTodos={() => navigate("/productos")}>
          <div className="ud-grid">
            {destacados.slice(0, 4).map(p => (
              <ProductoCard key={p.id_producto} producto={p}
                onNavigate={id => navigate(`/producto/${id}`)}
                onAgregar={handleAgregar}
              />
            ))}
          </div>
        </SeccionDashboard>
      )}

      {/* Catálogo */}
      <SeccionDashboard titulo="Catálogo" onVerTodos={() => navigate("/productos")}>
        <div className="ud-filtros">
          <input type="text" placeholder="Buscar producto o servicio..."
            className="ud-search" value={filtros.busqueda}
            onChange={e => { filtros.setBusqueda(e.target.value); filtros.setPagina(1) }}
          />
          <select className="ud-select" value={filtros.tipoActivo}
            onChange={e => filtros.toggleTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="producto">Producto</option>
            <option value="servicio">Servicio</option>
          </select>
        </div>
        {filtrados.length === 0
          ? <p className="ud-empty">No se encontraron productos</p>
          : <div className="ud-grid">
              {filtrados.slice(0, 8).map(p => (
                <ProductoCard key={p.id_producto} producto={p}
                  onNavigate={id => navigate(`/producto/${id}`)}
                  onAgregar={handleAgregar}
                />
              ))}
            </div>
        }
      </SeccionDashboard>

      {/* Pedidos recientes */}
      <PedidosRecientes pedidos={pedidos} />

      {/* Footer */}
      <DashboardFooter />

    </div>
  )
}