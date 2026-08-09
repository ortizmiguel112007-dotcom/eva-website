// usuario/components/dashboard/MetricasGrid.jsx
import { FiShoppingBag, FiClock, FiCheckCircle, FiHeart } from "react-icons/fi"
import "@/infrastructure/css/usuario/dashboard/loading/MetricasGrid.css"

const METRICAS = (activos, enCamino, completados, totalFavoritos) => [
  { label: "Pedidos activos", valor: activos,        sub: `+${activos} esta semana`, color: "#eff6ff", iconColor: "#3b82f6", Icon: FiShoppingBag },
  { label: "En camino",       valor: enCamino,       sub: "Llegan pronto",           color: "#fff7ed", iconColor: "#f97316", Icon: FiClock },
  { label: "Completados",     valor: completados,    sub: "Este mes",                color: "#f0fdf4", iconColor: "#16a34a", Icon: FiCheckCircle },
  { label: "Favoritos",       valor: totalFavoritos, sub: "En tu lista",             color: "#faf5ff", iconColor: "#a855f7", Icon: FiHeart },
]

export function MetricasGrid({ activos, enCamino, completados, totalFavoritos }) {
  return (
    <div className="ud-metricas">
      {METRICAS(activos, enCamino, completados, totalFavoritos).map(m => (
        <div key={m.label} className="ud-metrica">
          <div className="ud-metrica-left">          {/* ← faltaba este div */}
            <h3>{m.label}</h3>
            <span className="ud-metrica-num">{m.valor}</span>
            <span className="ud-metrica-sub">{m.sub}</span>
          </div>
          <div className="ud-metrica-icono" style={{ background: m.color }}>
            <m.Icon size={20} color={m.iconColor} />
          </div>
        </div>
      ))}
    </div>
  )
}