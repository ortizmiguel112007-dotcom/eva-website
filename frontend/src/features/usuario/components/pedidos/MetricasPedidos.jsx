import { FiPackage, FiClock, FiCheckCircle, FiUpload, FiAlertCircle } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/usuario/pedidos/MetricasPedidos.css"

export function MetricasPedidos({ pedidos }) {
  const pendientePago = pedidos.filter(p =>
    p.estado === "pendiente_pago" || p.estado === "pago_rechazado"
  ).length
  const enVerificacion = pedidos.filter(p => p.estado === "pago_enviado").length
  const activos        = pedidos.filter(p =>
    p.estado === "en_proceso" || p.estado === "enviado"
  ).length
  const entregados     = pedidos.filter(p => p.estado === "entregado").length
  const gastoTotal     = pedidos.reduce((acc, p) => acc + Number(p.total), 0)

  return (
    <div className="mp-metricas">
      <div className="mp-metrica">
        <div className="mp-metrica-left">
          <h3>Total pedidos</h3>
          <span>{pedidos.length}</span>
        </div>
        <div className="mp-metrica-icono-right total">
          <FiPackage size={18} />
        </div>
      </div>

      {pendientePago > 0 && (
        <div className="mp-metrica pendiente">
          <div className="mp-metrica-left">
            <h3>Sin pago</h3>
            <span style={{ color: "#f59e0b" }}>{pendientePago}</span>
          </div>
          <div className="mp-metrica-icono-right pendiente">
            <FiAlertCircle size={18} />
          </div>
        </div>
      )}

      {enVerificacion > 0 && (
        <div className="mp-metrica verificacion">
          <div className="mp-metrica-left">
            <h3>Por verificar</h3>
            <span style={{ color: "#3b82f6" }}>{enVerificacion}</span>
          </div>
          <div className="mp-metrica-icono-right verificacion">
            <FiUpload size={18} />
          </div>
        </div>
      )}

      <div className="mp-metrica">
        <div className="mp-metrica-left">
          <h3>Activos</h3>
          <span style={{ color: "#3b82f6" }}>{activos}</span>
        </div>
        <div className="mp-metrica-icono-right activos">
          <FiClock size={18} />
        </div>
      </div>

      <div className="mp-metrica">
        <div className="mp-metrica-left">
          <h3>Entregados</h3>
          <span style={{ color: "#16a34a" }}>{entregados}</span>
        </div>
        <div className="mp-metrica-icono-right entregados">
          <FiCheckCircle size={18} />
        </div>
      </div>

      <div className="mp-metrica">
        <div className="mp-metrica-left">
          <h3>Gasto total</h3>
          <span className="gasto">{formatPrecio(gastoTotal)}</span>
        </div>
        <div className="mp-metrica-icono-right gasto">
          <FiPackage size={18} />
        </div>
      </div>
    </div>
  )
}