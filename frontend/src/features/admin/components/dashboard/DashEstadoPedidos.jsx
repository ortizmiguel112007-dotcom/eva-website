import { FiShoppingBag } from "react-icons/fi"
import "@/infrastructure/css/admin/dashboard/DashEstadoPedidos.css"

export function DashEstadoPedidos({ pedidos }) {
  const estados = [
    { label: "Entregados", count: pedidos.filter(p => p.estado === "entregado").length,  color: "#10a34a" },
    { label: "En proceso", count: pedidos.filter(p => p.estado === "en_proceso").length, color: "#f97316" },
    { label: "Enviados",   count: pedidos.filter(p => p.estado === "enviado").length,    color: "#3b82f6" },
    { label: "Cancelados", count: pedidos.filter(p => p.estado === "cancelado").length,  color: "#ef4444" },
  ]
  const total = pedidos.length || 1

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div>
          <h3 className="dash-card-titulo">Estado de Pedidos</h3>
          <p className="dash-card-sub">Distribución actual</p>
        </div>
      </div>
      <div className="dash-estados">
        {estados.map(e => {
          const pct = Math.round((e.count / total) * 100)
          return (
            <div key={e.label} className="dash-estado-item">
              <div className="dash-estado-left">
                <div className="dash-estado-dot" style={{ background: e.color }} />
                <span className="dash-estado-label">{e.label}</span>
              </div>
              <div className="dash-estado-bar-wrap">
                <div className="dash-estado-bar" style={{ width: `${pct}%`, background: e.color }} />
              </div>
              <div className="dash-estado-right">
                <span style={{ fontWeight: 700, color: e.color }}>{e.count}</span>
                <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{pct}%</span>
              </div>
            </div>
          )
        })}
        <div className="dash-total-pedidos">
          <FiShoppingBag size={14} color="#94a3b8" />
          <span>{pedidos.length} pedidos en total</span>
        </div>
      </div>
    </div>
  )
}