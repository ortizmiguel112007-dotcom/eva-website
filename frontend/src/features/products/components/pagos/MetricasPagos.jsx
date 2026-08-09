import { FiDollarSign, FiClock, FiCheck, FiX } from "react-icons/fi"

import "@/infrastructure/css/products-emprend/pagos/MetricasPagos.css"

export function MetricasPagos({ pagos }) {
  const metricas = [
    { label: "Total",       valor: pagos.length,                                    color: "#1e293b", bg: "#f8fafc", Icon: FiDollarSign },
    { label: "Pendientes",  valor: pagos.filter(p => p.estado === "pendiente").length,  color: "#f59e0b", bg: "#fffbeb", Icon: FiClock     },
    { label: "Verificados", valor: pagos.filter(p => p.estado === "verificado").length, color: "#16a34a", bg: "#f0fdf4", Icon: FiCheck     },
    { label: "Rechazados",  valor: pagos.filter(p => p.estado === "rechazado").length,  color: "#ef4444", bg: "#fef2f2", Icon: FiX         },
  ]

  return (
    <div className="pagos-metricas">
      {metricas.map(m => (
        <div key={m.label} className="pagos-metrica">
          <div>
            <p className="pagos-metrica-label">{m.label}</p>
            <strong className="pagos-metrica-valor" style={{ color: m.color }}>{m.valor}</strong>
          </div>
          <div className="pagos-metrica-icono" style={{ background: m.bg }}>
            <m.Icon size={16} color={m.color} />
          </div>
        </div>
      ))}
    </div>
  )
}