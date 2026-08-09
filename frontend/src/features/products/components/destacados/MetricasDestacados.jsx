
import "@/infrastructure/css/products-emprend/destacados/MetricasDestacados.css"

export function MetricasDestacados({ productos }) {
  return (
    <div className="destacados-metricas">
      <div className="destacado-metrica">
        <h3>{productos.length}</h3>
        <span>Total Productos</span>
      </div>
      <div className="destacado-metrica activos">
        <h3>{productos.filter(p => p.destacado).length}</h3>
        <span>Destacados Activos</span>
      </div>
      <div className="destacado-metrica">
        <h3>{productos.filter(p => !p.destacado).length}</h3>
        <span>Sin Destacar</span>
      </div>
    </div>
  )
}