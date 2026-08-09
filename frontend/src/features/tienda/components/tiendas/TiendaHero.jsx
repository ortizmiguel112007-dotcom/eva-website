// tienda/components/tiendas/TiendaHero.jsx
import { FiArrowLeft } from "react-icons/fi"
import { getAvatarGradient, getInitials } from "@/features/tienda/utils/avatar"
import { formatPrecio } from "@/features/tienda/utils/utils"

import "@/infrastructure/css/tienda/tiendas-perfil/TiendaHero.css"

export function TiendaHero({ nombreTienda, productos, onVolver }) {
  const [c1, c2]   = getAvatarGradient(nombreTienda)
  const nProductos = productos.filter(p => p.tipo === "producto").length
  const nServicios = productos.filter(p => p.tipo === "servicio").length
  const precioMin  = productos.length
    ? formatPrecio(Math.min(...productos.map(p => Number(p.precio))))
    : null

  return (
    <div className="pt-hero">
      <div className="pt-hero-bg" />
      <div className="pt-hero-blur pt-blur-1" />
      <div className="pt-hero-blur pt-blur-2" />

      <button className="pt-btn-volver" onClick={onVolver}>
        <FiArrowLeft size={15} /> Tiendas
      </button>

      <div className="pt-hero-content">
        <div className="pt-avatar-wrap">
          <div className="pt-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
            {getInitials(nombreTienda)}
          </div>
        </div>
        <div className="pt-hero-info">
          <h1 className="pt-hero-nombre">{nombreTienda}</h1>
          <p className="pt-hero-sub">Emprendedora EVA</p>
          <div className="pt-hero-stats">
            <div className="pt-stat"><strong>{productos.length}</strong><span>Total</span></div>
            <div className="pt-stat-div" />
            <div className="pt-stat"><strong>{nProductos}</strong><span>Productos</span></div>
            <div className="pt-stat-div" />
            <div className="pt-stat"><strong>{nServicios}</strong><span>Servicios</span></div>
            {precioMin && (
              <>
                <div className="pt-stat-div" />
                <div className="pt-stat"><strong>{precioMin}</strong><span>Desde</span></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}