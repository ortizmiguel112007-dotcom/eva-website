import { FiPackage, FiClock, FiCheckCircle, FiCalendar, FiEye, FiTruck, FiUpload, FiAlertCircle, FiXCircle } from "react-icons/fi"
import { formatPrecio, formatFecha } from "@/features/tienda/utils/utils"
import { formatId } from "@/features/usuario/utils/utils"
import "@/infrastructure/css/usuario/pedidos/PedidoCard.css"

const ESTADO_CONFIG = {
  pendiente_pago:  { icon: <FiClock size={11} />,       label: "Pendiente de pago",  cls: "pendiente_pago"  },
  pago_enviado:    { icon: <FiUpload size={11} />,      label: "Pago enviado",        cls: "pago_enviado"    },
  pago_rechazado:  { icon: <FiAlertCircle size={11} />, label: "Pago rechazado",      cls: "pago_rechazado"  },
  en_proceso:      { icon: <FiClock size={11} />,       label: "En proceso",          cls: "en_proceso"      },
  enviado:         { icon: <FiTruck size={11} />,       label: "Enviado",             cls: "enviado"         },
  entregado:       { icon: <FiCheckCircle size={11} />, label: "Entregado",           cls: "entregado"       },
  cancelado:       { icon: <FiXCircle size={11} />,     label: "Cancelado",           cls: "cancelado"       },
}

export function PedidoCard({ pedido, onVerDetalle, onSubirComprobante }) {
  const primera = pedido.detalles?.[0]?.producto
  const estado  = ESTADO_CONFIG[pedido.estado] || { label: pedido.estado, cls: "" }

  return (
    <div className="mp-card-nuevo">
      <div className="mp-card-thumb">
        {primera?.imagen
          ? <img src={primera.imagen} alt={primera.nombre_producto} />
          : <FiPackage size={20} color="#94a3b8" />
        }
      </div>

      <div className="mp-card-info">
        <p className="mp-card-id">{formatId(pedido.id_pedido)}</p>
        <div className="mp-card-meta">
          <FiCalendar size={11} />
          <span>{formatFecha(pedido.fecha)}</span>
        </div>
        <p className="mp-card-articulos">
          {pedido.detalles.length} {pedido.detalles.length === 1 ? "artículo" : "artículos"}
        </p>
      </div>

      <div className="mp-card-right">
        <span className={`mp-badge ${estado.cls}`}>
          {estado.icon} {estado.label}
        </span>
        <div className="mp-card-total-wrap">
          <span className="mp-card-total-label">Total</span>
          <span className="mp-card-total-valor">{formatPrecio(pedido.total)}</span>
        </div>
        <div className="mp-card-btns">
          <button className="mp-btn-detalle" onClick={() => onVerDetalle(pedido)}>
            <FiEye size={14} /> Ver detalles
          </button>
          {/* Botón subir comprobante si pago pendiente o rechazado */}
          {(pedido.estado === "pendiente_pago" || pedido.estado === "pago_rechazado") &&
           pedido.metodo_pago !== "contraentrega" && (
            <button className="mp-btn-comprobante" onClick={() => onSubirComprobante(pedido)}>
              <FiUpload size={14} />
              {pedido.estado === "pago_rechazado" ? "Reenviar comprobante" : "Subir comprobante"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}