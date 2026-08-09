
import "@/infrastructure/css/admin/auditoria_inventario/MetricasAuditoria.css"

export function MetricasAuditoria({ totalItems, totalOk, totalBajo, totalAgotado }) {
  return (
    <div className="ai-metricas">
      <div className="ai-metrica total">
        <p className="ai-metrica-label">Total productos</p>
        <strong className="ai-metrica-valor">{totalItems}</strong>
      </div>
      <div className="ai-metrica ok">
        <p className="ai-metrica-label">Stock OK</p>
        <strong className="ai-metrica-valor">{totalOk}</strong>
      </div>
      <div className="ai-metrica bajo">
        <p className="ai-metrica-label">Stock bajo</p>
        <strong className="ai-metrica-valor">{totalBajo}</strong>
      </div>
      <div className="ai-metrica agotado">
        <p className="ai-metrica-label">Agotados</p>
        <strong className="ai-metrica-valor">{totalAgotado}</strong>
      </div>
    </div>
  )
}