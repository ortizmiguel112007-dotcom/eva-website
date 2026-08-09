import { FiCheckCircle, FiAlertCircle } from "react-icons/fi"

import "@/infrastructure/css/products-emprend/cupones/MetricasCupones.css"

export function MetricasCupones({ cupones, getEstado }) {
  return (
    <div className="cupones-metricas">
      <div className="cupon-metrica">
        <h3>{cupones.length}</h3>
        <span>Total cupones</span>
      </div>
      <div className="cupon-metrica activos">
        <h3>{cupones.filter(c => getEstado(c) === "activo").length}</h3>
        <span><FiCheckCircle size={11} /> Activos</span>
      </div>
      <div className="cupon-metrica expirados">
        <h3>{cupones.filter(c => getEstado(c) === "expirado").length}</h3>
        <span><FiAlertCircle size={11} /> Expirados</span>
      </div>
      <div className="cupon-metrica">
        <h3>{cupones.reduce((acc, c) => acc + c.usos, 0)}</h3>
        <span>Usos totales</span>
      </div>
    </div>
  )
}