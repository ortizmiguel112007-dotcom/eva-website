import { FiGift, FiCheckCircle, FiCalendar, FiAlertCircle, FiTrendingUp } from "react-icons/fi"

import "@/infrastructure/css/products-emprend/cupones/MetricasCupones.css"

export function MetricasCupones({ cupones, getEstado }) {
  const activos     = cupones.filter(c => getEstado(c) === "activo").length
  const programados = cupones.filter(c => getEstado(c) === "programado").length
  const expirados   = cupones.filter(c => getEstado(c) === "expirado" || getEstado(c) === "agotado").length
  const usosTotales = cupones.reduce((acc, c) => acc + c.usos, 0)

  return (
    <div className="cupones-metricas">
      <div className="cupon-metrica total">
        <div className="cupon-metrica-icon"><FiGift size={16} /></div>
        <div>
          <h3>{cupones.length}</h3>
          <span>Total cupones</span>
        </div>
      </div>

      <div className="cupon-metrica activos">
        <div className="cupon-metrica-icon"><FiCheckCircle size={16} /></div>
        <div>
          <h3>{activos}</h3>
          <span>Activos</span>
        </div>
      </div>

      <div className="cupon-metrica programados">
        <div className="cupon-metrica-icon"><FiCalendar size={16} /></div>
        <div>
          <h3>{programados}</h3>
          <span>Programados</span>
        </div>
      </div>

      <div className="cupon-metrica expirados">
        <div className="cupon-metrica-icon"><FiAlertCircle size={16} /></div>
        <div>
          <h3>{expirados}</h3>
          <span>Vencidos / agotados</span>
        </div>
      </div>

      <div className="cupon-metrica usos">
        <div className="cupon-metrica-icon"><FiTrendingUp size={16} /></div>
        <div>
          <h3>{usosTotales}</h3>
          <span>Usos totales</span>
        </div>
      </div>
    </div>
  )
}