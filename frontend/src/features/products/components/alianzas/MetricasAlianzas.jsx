export function MetricasAlianzas({ alianzas }) {
  return (
    <div className="alianzas-metricas">
      <div className="alianza-metrica">
        <h3>{alianzas.length}</h3>
        <span>Total Alianzas</span>
      </div>
      <div className="alianza-metrica pendientes">
        <h3>{alianzas.filter(a => a.estado === "pendiente").length}</h3>
        <span>Pendientes</span>
      </div>
      <div className="alianza-metrica activas">
        <h3>{alianzas.filter(a => a.estado === "activa").length}</h3>
        <span>Activas</span>
      </div>
      <div className="alianza-metrica finalizadas">
        <h3>{alianzas.filter(a => a.estado === "finalizada").length}</h3>
        <span>Finalizadas</span>
      </div>
    </div>
  )
}