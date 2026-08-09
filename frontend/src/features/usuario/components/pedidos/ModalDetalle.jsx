import { FiX, FiPackage, FiDollarSign, FiStar, FiDownload, FiUpload, FiAlertCircle, FiSmartphone, FiCreditCard, FiTruck } from "react-icons/fi"
import { formatPrecio, formatFecha } from "@/features/tienda/utils/utils"
import { formatId } from "@/features/usuario/utils/utils"
import "@/infrastructure/css/usuario/pedidos/ModalDetalle.css"

const ESTADO_LABELS = {
  pendiente_pago: "Pendiente de pago",
  pago_enviado:   "Pago enviado — en verificación",
  pago_rechazado: "Pago rechazado",
  en_proceso:     "En proceso",
  enviado:        "Enviado",
  entregado:      "Entregado",
  cancelado:      "Cancelado",
}

const METODO_ICONS = {
  nequi:         <FiSmartphone size={14} color="#7c3aed" />,
  bancolombia:   <FiCreditCard  size={14} color="#2563eb" />,
  contraentrega: <FiTruck       size={14} color="#16a34a" />,
}

export function ModalDetalle({ pedido, onClose, onResena, onSubirComprobante }) {
  if (!pedido) return null
  const id = formatId(pedido.id_pedido)

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal-detalle" onClick={e => e.stopPropagation()}>
        <div className="mp-modal-detalle-header">
          <div>
            <h3>{id}</h3>
            <p>Fecha: {formatFecha(pedido.fecha)}</p>
          </div>
          <button className="mp-modal-cerrar" onClick={onClose}>
            <FiX size={14} />
          </button>
        </div>

        <div className="mp-modal-body">
          {/* Estado */}
          <div className="mp-modal-seccion">
            <h4>Estado del pedido</h4>
            <span className={`mp-badge ${pedido.estado}`}>
              {ESTADO_LABELS[pedido.estado] || pedido.estado}
            </span>
            {pedido.estado === "pago_rechazado" && pedido.pago?.nota_rechazo && (
              <div className="mp-modal-rechazo-nota">
                <FiAlertCircle size={13} color="#ef4444" />
                <span>{pedido.pago.nota_rechazo}</span>
              </div>
            )}
          </div>

          {/* Productos */}
          <div className="mp-modal-seccion">
            <h4>Productos</h4>
            {pedido.detalles.map(d => (
              <div key={d.id_detalle} className="mp-modal-producto">
                {d.producto?.imagen
                  ? <img src={d.producto.imagen} alt={d.producto.nombre_producto} className="mp-modal-producto-img" />
                  : <div className="mp-modal-producto-placeholder"><FiPackage size={18} color="#94a3b8" /></div>
                }
                <div className="mp-modal-producto-info">
                  <p>{d.producto?.nombre_producto}</p>
                  <span>Cantidad: {d.cantidad}</span>
                  <span>{formatPrecio(d.precio_unit)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Método de pago */}
          {pedido.metodo_pago && (
            <div className="mp-modal-seccion">
              <h4>Método de pago</h4>
              <div className="mp-modal-info-row">
                {METODO_ICONS[pedido.metodo_pago] || <FiDollarSign size={14} color="#64748b" />}
                <span style={{ textTransform: "capitalize" }}>{pedido.metodo_pago}</span>
              </div>
            </div>
          )}

          {/* Comprobante si fue rechazado */}
          {(pedido.estado === "pendiente_pago" || pedido.estado === "pago_rechazado") &&
           pedido.metodo_pago !== "contraentrega" && (
            <div className="mp-modal-seccion">
              <button className="mp-btn-comprobante-modal"
                onClick={() => { onClose(); onSubirComprobante(pedido) }}>
                <FiUpload size={14} />
                {pedido.estado === "pago_rechazado" ? "Reenviar comprobante" : "Subir comprobante"}
              </button>
            </div>
          )}

          {pedido.nota && (
            <div className="mp-modal-seccion">
              <h4>Nota</h4>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>{pedido.nota}</p>
            </div>
          )}

          <div className="mp-modal-seccion">
            <h4>Número de seguimiento</h4>
            <span className="mp-seguimiento-num">
              EVA{String(pedido.id_pedido).padStart(9, "0")}
            </span>
          </div>

          <div className="mp-modal-total">
            <span>Total</span>
            <span>{formatPrecio(pedido.total)}</span>
          </div>

          {pedido.estado === "entregado" && (
            <button className="mp-btn-resena-modal"
              onClick={() => { onClose(); onResena(pedido) }}>
              <FiStar size={14} /> Dejar reseña
            </button>
          )}

          <button className="mp-btn-factura">
            <FiDownload size={16} /> Descargar factura
          </button>
        </div>
      </div>
    </div>
  )
}