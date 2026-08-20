import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/products-emprend/alianzas/MetricasAlianzas.css"

export function MetricasAlianzas({ metricas }) {
  if (!metricas) return <p className="ma-vacio">Cargando métricas...</p>

  const items = [
    { label: "Visitas", valor: metricas.visitas },
    { label: "Clics", valor: metricas.clics },
    { label: "Ventas totales", valor: metricas.total_ventas },
    { label: "Ingresos generados", valor: formatPrecio(metricas.ingreso_total) },
  ]

  return (
    <div className="ma-grid">
      {items.map((i) => (
        <div key={i.label} className="ma-item">
          <strong>{i.valor}</strong>
          <span>{i.label}</span>
        </div>
      ))}
    </div>
  )
}