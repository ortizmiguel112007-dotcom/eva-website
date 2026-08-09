import { FiAlertTriangle, FiPackage, FiUsers, FiStar } from "react-icons/fi"
import "@/infrastructure/css/admin/dashboard/DashAlertas.css"

export function DashAlertas({ stockBajo, pendientesAprobacion, onNavigate }) {
  return (
    <>
      <div className="dash-alertas-header">
        <FiAlertTriangle size={16} color="#f59e0b" />
        <h3>Alertas y Notificaciones</h3>
      </div>
      <div className="dash-alertas">
        <div className="dash-alerta amarillo">
          <div className="dash-alerta-icon" style={{ background: "#fde68a" }}>
            <FiPackage size={16} color="#92400e" />
          </div>
          <div className="dash-alerta-content">
            <div className="dash-alerta-top">
              <span>Productos con bajo stock</span>
              <span className="dash-alerta-badge amarillo">{stockBajo}</span>
            </div>
            <p className="dash-alerta-desc">Requieren reabastecimiento pronto</p>
          </div>
          <button className="dash-alerta-btn" onClick={() => onNavigate("/admin/productos")}>Ver →</button>
        </div>

        <div className="dash-alerta azul">
          <div className="dash-alerta-icon" style={{ background: "#bfdbfe" }}>
            <FiUsers size={16} color="#1e40af" />
          </div>
          <div className="dash-alerta-content">
            <div className="dash-alerta-top">
              <span>Emprendedoras pendientes</span>
              <span className="dash-alerta-badge azul">{pendientesAprobacion}</span>
            </div>
            <p className="dash-alerta-desc">Solicitudes de aprobación</p>
          </div>
          <button className="dash-alerta-btn" onClick={() => onNavigate("/admin/users")}>Ver →</button>
        </div>

        <div className="dash-alerta rojo">
          <div className="dash-alerta-icon" style={{ background: "#fecaca" }}>
            <FiStar size={16} color="#991b1b" />
          </div>
          <div className="dash-alerta-content">
            <div className="dash-alerta-top">
              <span>Reportes inapropiados</span>
              <span className="dash-alerta-badge rojo">0</span>
            </div>
            <p className="dash-alerta-desc">Sin reportes pendientes</p>
          </div>
          <button className="dash-alerta-btn" onClick={() => onNavigate("/admin/resenas")}>Ver →</button>
        </div>
      </div>
    </>
  )
}