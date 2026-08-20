import "@/infrastructure/css/products-emprend/destacados/MetricasDestacados.css"

export function MetricasDestacados({ metricas }) {
  if (!metricas || metricas.length === 0) {
    return <p className="md-vacio">No hay datos de métricas todavía</p>
  }

  return (
    <div className="md-tabla-wrap">
      <table className="md-tabla">
        <thead>
          <tr><th>Producto</th><th>Visitas</th><th>Clics</th><th>Conversiones</th></tr>
        </thead>
        <tbody>
          {metricas.map((m) => (
            <tr key={m.id_producto}>
              <td>{m.nombre || `Producto #${m.id_producto}`}</td>
              <td>{m.visitas}</td>
              <td>{m.clics}</td>
              <td>{m.conversiones}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}