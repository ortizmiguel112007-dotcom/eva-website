import { FiPackage, FiUser, FiEye, FiCheck, FiX, FiSmartphone, FiCreditCard, FiTruck } from "react-icons/fi"
import { formatPrecio, formatFecha } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/products-emprend/pagos/PagoCard.css"

const ESTADO_BADGE = {
  pendiente: { bg: "#fffbeb", color: "#f59e0b", border: "#fde68a", label: "Pendiente" },
  aprobado:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Aprobado"  },
  rechazado: { bg: "#fef2f2", color: "#ef4444", border: "#fecaca", label: "Rechazado" },
}

const METODO_INFO = {
  nequi:         { icon: <FiSmartphone size={12} color="#7c3aed" />, label: "Nequi"          },
  bancolombia:   { icon: <FiCreditCard  size={12} color="#2563eb" />, label: "Bancolombia"    },
  contraentrega: { icon: <FiTruck       size={12} color="#16a34a" />, label: "Contra entrega" },
}

export function Badge({ estado }) {
  const s = ESTADO_BADGE[estado] || ESTADO_BADGE.pendiente
  return (
    <span className="pagos-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {s.label}
    </span>
  )
}

export function PagoCard({ pago, onVerDetalle, onVerificar, soloLectura = false }) {
  const metodo = METODO_INFO[pago.metodo] || { icon: null, label: pago.metodo?.toUpperCase() }
  const pedidos = pago.pedidos || []

  return (
    <div className="pago-card">
      <div className="pago-card-info">
        <div className="pago-card-row">
          <FiPackage size={14} color="#64748b" />
          <span className="pago-card-pedido">
            Pago #{pago.id_pago} · {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
          </span>
          <Badge estado={pago.estado} />
        </div>
        <div className="pago-card-row">
          <FiUser size={12} color="#94a3b8" />
          <span className="pago-card-cliente">
            {pago.cliente?.nombre} — {pago.cliente?.email}
          </span>
        </div>
        <div className="pago-card-row">
          {metodo.icon}
          <span className="pago-card-meta">
            {metodo.label} · {formatFecha(pago.fecha)}
          </span>
        </div>
        <div className="pago-card-productos">
          {pedidos.map(p => (
            <span key={p.id_pedido} className="pago-card-producto">
              Pedido #{p.id_pedido} ({formatPrecio(p.total)})
            </span>
          ))}
        </div>
      </div>

      <div className="pago-card-total">
        <strong>{formatPrecio(pago.monto_total)}</strong>
        <span>Total pago</span>
      </div>

      <div className="pago-card-acciones">
        {pago.metodo !== "contraentrega" && (
          <button className="pago-btn-ver" onClick={() => onVerDetalle(pago)}>
            <FiEye size={13} /> Ver comprobante
          </button>
        )}

        {!soloLectura && pago.estado === "pendiente" && (
          <>
            <button className="pago-btn-verificar" onClick={() => onVerificar(pago.id_pago, "aprobado")}>
              <FiCheck size={13} /> Aprobar
            </button>
            {pago.metodo !== "contraentrega" && (
              <button className="pago-btn-rechazar" onClick={() => onVerDetalle(pago)}>
                <FiX size={13} /> Rechazar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}