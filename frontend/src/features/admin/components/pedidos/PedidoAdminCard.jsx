import { FiUser, FiCalendar, FiShoppingBag, FiPackage, FiChevronDown, FiChevronUp } from "react-icons/fi"
import { formatPrecio, formatFecha } from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/pedidos/PedidoAdminCard.css"

const ESTADOS = {
  en_proceso: { clase: "proceso",   label: "En proceso" },
  enviado:    { clase: "enviado",   label: "Enviado"    },
  entregado:  { clase: "entregado", label: "Entregado"  },
  cancelado:  { clase: "cancelado", label: "Cancelado"  },
}

export function PedidoAdminCard({ pedido: p, expandido, onToggle, onCambiarEstado }) {
  const est   = ESTADOS[p.estado] || ESTADOS.en_proceso
  const isExp = expandido === p.id_pedido

  return (
    <div className="ap-card">
      <div className="ap-card-row" onClick={() => onToggle(p.id_pedido)}>
        <div className="ap-card-left">
          <div className="ap-card-titulo">
            <span className="ap-card-num">Pedido #{p.id_pedido}</span>
            <span className={`ap-badge ap-badge--${est.clase}`}>{est.label}</span>
          </div>
          <div className="ap-card-meta">
            <span><FiUser size={11} /> {p.cliente?.nombre || "Cliente"}</span>
            <span><FiCalendar size={11} /> {formatFecha(p.fecha)}</span>
            <span><FiShoppingBag size={11} /> {p.detalles?.length || 0} producto(s)</span>
          </div>
        </div>

        <strong className="ap-card-total">{formatPrecio(p.total)}</strong>

        <select value={p.estado}
          onChange={e => { e.stopPropagation(); onCambiarEstado(p.id_pedido, e.target.value) }}
          onClick={e => e.stopPropagation()}
          className="ap-estado-select">
          <option value="en_proceso">En proceso</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <div className="ap-chevron">
          {isExp ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
        </div>
      </div>

      {isExp && (
        <div className="ap-card-detalle">
          <p className="ap-detalle-titulo">Productos del pedido</p>
          {p.detalles?.length > 0 ? p.detalles.map(d => (
            <div key={d.id_detalle} className="ap-detalle-row">
              <span>
                <FiPackage size={11} />
                {d.producto?.nombre_producto || "Producto"} × {d.cantidad}
              </span>
              <span>{formatPrecio(Number(d.precio_unit) * d.cantidad)}</span>
            </div>
          )) : (
            <p className="ap-detalle-vacio">Sin productos registrados</p>
          )}
          <div className="ap-detalle-footer">
            <span className="ap-detalle-total-label">Total del pedido</span>
            <span className="ap-detalle-total-valor">{formatPrecio(p.total)}</span>
          </div>
          {p.nota && <p className="ap-nota">{p.nota}</p>}
          {p.metodo_pago && <p className="ap-nota">💳 Método de pago: {p.metodo_pago}</p>}
        </div>
      )}
    </div>
  )
}