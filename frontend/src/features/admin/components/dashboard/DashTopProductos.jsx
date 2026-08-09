import { FiShoppingBag } from "react-icons/fi"
import { formatPrecio, BAR_COLORS } from "@/features/admin/utils/utils"
import "@/infrastructure/css/admin/dashboard/DashTopProductos.css"

export function DashTopProductos({ productos }) {
  if (productos.length === 0) return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-titulo">Top Productos</h3>
        <p className="dash-card-sub">Por unidades vendidas</p>
      </div>
      <div className="dash-empty">
        <FiShoppingBag size={32} color="#e2e8f0" />
        <p>Sin datos de ventas aún</p>
      </div>
    </div>
  )

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div>
          <h3 className="dash-card-titulo">Top Productos</h3>
          <p className="dash-card-sub">Por unidades vendidas</p>
        </div>
      </div>
      <div className="dash-top-lista">
        {productos.map((p, i) => {
          const maxVentas = productos[0]?.ventas || 1
          const pct = Math.round((p.ventas / maxVentas) * 100)
          return (
            <div key={p.nombre} className="dash-top-item">
              <div className="dash-top-num" style={{ background: BAR_COLORS[i] }}>{i + 1}</div>
              <div className="dash-top-info">
                <p>{p.nombre}</p>
                <div className="dash-top-bar-wrap">
                  <div className="dash-top-bar" style={{ width: `${pct}%`, background: BAR_COLORS[i] }} />
                </div>
              </div>
              <div className="dash-top-right">
                <span className="dash-top-ventas">{p.ventas} uds</span>
                <span className="dash-top-total">{formatPrecio(p.total)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}