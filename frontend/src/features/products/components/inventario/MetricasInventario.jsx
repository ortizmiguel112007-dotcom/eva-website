import "@/infrastructure/css/products-emprend/inventario/MetricasInventario.css"

export function MetricasInventario({ items }) {
  const totalProductos = items.length
  const stockBajo = items.filter(i => i.tipo !== "servicio" && i.cantidad > 0 && i.cantidad <= i.stock_minimo).length
  const sinStock  = items.filter(i => i.tipo !== "servicio" && i.cantidad === 0).length

  return (
    <div className="inventario-metricas">
      <div className="metrica-box">
        <h3>{totalProductos}</h3>
        <span>Total Productos</span>
      </div>
      <div className="metrica-box alerta">
        <h3>{stockBajo}</h3>
        <span>Stock Bajo</span>
      </div>
      <div className="metrica-box peligro">
        <h3>{sinStock}</h3>
        <span>Sin Stock</span>
      </div>
    </div>
  )
}