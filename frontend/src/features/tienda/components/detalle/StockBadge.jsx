// tienda/components/detalle/StockBadge.jsx
import "@/infrastructure/css/tienda/detalle/StockBadge.css"
export function StockBadge({ inventario, tipo }) {
  if (tipo === "servicio") return null
  const stock    = inventario?.cantidad ?? 0
  const stockMin = inventario?.stock_minimo ?? 0
  const estado   = stock === 0 ? "agotado" : stock <= stockMin ? "bajo" : "ok"
  const label    = stock === 0 ? "Agotado" : stock <= stockMin ? `Stock bajo (${stock})` : `${stock} disponibles`

  return (
    <div className={`dp-stock dp-stock--${estado}`}>
      <div className="dp-stock-dot" /> {label}
    </div>
  )
}