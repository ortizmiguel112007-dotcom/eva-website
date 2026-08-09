import { FiFileText, FiPackage, FiCalendar, FiEye, FiDownload } from "react-icons/fi"
import { MdOutlineQrCode2 } from "react-icons/md"
import { formatPrecio, formatFecha } from "@/features/tienda/utils/utils"

import "@/infrastructure/css/usuario/facturas/FacturaCard.css"

const ESTADO_INFO = {
  en_proceso: { label: "En proceso", color: "#2563eb" },
  enviado:    { label: "Enviado",    color: "#7c3aed" },
  entregado:  { label: "✓ Entregado", color: "#16a34a" },
  cancelado:  { label: "Cancelado",  color: "#ef4444" },
}

export function FacturaCard({ factura, idx, onPreview, onDescargar }) {
  const pedido = factura.pedido
  const tienda = pedido?.seccion?.emprendedora?.usuario?.nombre || "EVA"
  const estado = ESTADO_INFO[pedido?.estado] || { label: pedido?.estado, color: "#94a3b8" }

  return (
    <div className="mf-card" style={{ animationDelay: `${idx * 0.06}s` }}>
      <div className="mf-card-stripe" />
      <div className="mf-card-icon">
        <FiFileText size={20} color="#6366f1" />
        <span className="mf-card-icon-num">#{pedido?.id_pedido}</span>
      </div>
      <div className="mf-card-info">
        <div className="mf-card-titulo-row">
          <h3 className="mf-card-titulo">Factura {factura.numero}</h3>
          <span className="mf-card-estado" style={{ color: estado.color, borderColor: estado.color }}>
            {estado.label}
          </span>
        </div>
        <div className="mf-card-meta">
          <span><FiPackage size={11} /> {tienda}</span>
          <span><FiCalendar size={11} /> {formatFecha(pedido?.fecha)}</span>
          <span><MdOutlineQrCode2 size={11} /> {pedido?.pago?.metodo?.toUpperCase() || "—"}</span>
          <span className="mf-card-items">
            {pedido?.detalles?.length} producto{pedido?.detalles?.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="mf-card-total">
        <span className="mf-card-total-label">Total</span>
        <strong className="mf-card-total-valor">{formatPrecio(pedido?.total)}</strong>
      </div>
      <div className="mf-card-acciones">
        <button className="mf-btn-ver" onClick={() => onPreview(factura)}>
          <FiEye size={13} /> Vista previa
        </button>
        <button className="mf-btn-descargar" onClick={() => onDescargar(factura)}>
          <FiDownload size={13} /> Descargar
        </button>
      </div>
    </div>
  )
}