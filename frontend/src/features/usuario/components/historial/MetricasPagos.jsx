import { formatPrecio } from "@/features/tienda/utils/utils"
import { FiDollarSign, FiCheck, FiClock, FiTrendingUp } from "react-icons/fi"
import "@/infrastructure/css/usuario/historialpagos/MetricasPagos.css"

export function MetricasPagos({ pedidos }) {
  const totalGastado = pedidos
    .filter(p => p.pago?.estado === "verificado")
    .reduce((acc, p) => acc + Number(p.total), 0)

  const metricas = [
    { label: "Total pagos",   valor: pedidos.length,                                              color: "#3b82f6", bg: "#eff6ff", Icon: FiDollarSign              },
    { label: "Verificados",   valor: pedidos.filter(p => p.pago?.estado === "verificado").length, color: "#10b981", bg: "#ecfdf5", Icon: FiCheck                   },
    { label: "Pendientes",    valor: pedidos.filter(p => p.pago?.estado === "pendiente").length,  color: "#f59e0b", bg: "#fffbeb", Icon: FiClock                   },
    { label: "Total gastado", valor: formatPrecio(totalGastado),                                  color: "#0f172a", bg: "#f8fafc", Icon: FiTrendingUp, grande: true },
  ]

  return (
    <div className="hp-metricas">
      {metricas.map(m => (
        <div key={m.label} className="hp-metrica" style={{ "--mc": m.color, "--mb": m.bg }}>
          <div className="hp-metrica-icono">
            <m.Icon size={16} color={m.color} />
          </div>
          <div>
            <p className="hp-metrica-label">{m.label}</p>
            <strong className={`hp-metrica-valor ${m.grande ? "grande" : ""}`} style={{ color: m.color }}>
              {m.valor}
            </strong>
          </div>
        </div>
      ))}
    </div>
  )
}