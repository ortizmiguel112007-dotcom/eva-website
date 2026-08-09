import { formatPrecio, formatFecha } from "@/features/tienda/utils/utils"
import { CambiarEstado } from "./CambiarEstado"
import { getInitials } from "@/features/tienda/utils/avatar"
import { FiSmartphone, FiCreditCard, FiTruck } from "react-icons/fi"
import "@/infrastructure/css/products-emprend/pedidos/PedidoCard.css"

function formatNumPedido(id) {
  return `#PED-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`
}

function Avatar({ nombre, estado }) {
  return (
    <div className={`pedido-avatar ${estado}`}>
      {getInitials(nombre) || "?"}
    </div>
  )
}

const METODO_INFO = {
  nequi:         { icon: <FiSmartphone size={11} />, label: "Nequi"          },
  bancolombia:   { icon: <FiCreditCard  size={11} />, label: "Bancolombia"    },
  contraentrega: { icon: <FiTruck       size={11} />, label: "Contra entrega" },
}

const PAGO_ESTADO = {
  pendiente_pago:  { label: "Sin comprobante", cls: "pago-pendiente"  },
  pago_enviado:    { label: "Comprobante enviado", cls: "pago-enviado"    },
  pago_rechazado:  { label: "Comprobante rechazado", cls: "pago-rechazado"  },
  en_proceso:      { label: "Pago confirmado", cls: "pago-confirmado" },
}

export function PedidoCard({ pedido, onCambiarEstado }) {
  const metodo    = METODO_INFO[pedido.metodo_pago]
  const pagoEstado = PAGO_ESTADO[pedido.estado]

  return (
    <div className="pedido-card">
      <div className="pedido-card-header">
        <span className="pedido-num">{formatNumPedido(pedido.id_pedido)}</span>
        <span className="pedido-fecha">{formatFecha(pedido.fecha)}</span>
      </div>

      <div className="pedido-cliente-row">
        <Avatar nombre={pedido.cliente?.nombre} estado={pedido.estado} />
        <div>
          <div className="pedido-cliente">{pedido.cliente?.nombre}</div>
          <div className="pedido-cliente-email">{pedido.cliente?.email}</div>
        </div>
      </div>

      {/* 🆕 Estado de pago */}
      {pagoEstado && (
        <div className={`pedido-pago-badge ${pagoEstado.cls}`}>
          {pagoEstado.label}
        </div>
      )}

      <div className="pedido-productos">
        {pedido.detalles?.map(d => (
          <div key={d.id_detalle} className="pedido-producto-item">
            {d.producto?.imagen
              ? <img src={d.producto.imagen} alt={d.producto.nombre_producto} className="pedido-producto-img" />
              : <div className="pedido-producto-sin-img">📦</div>
            }
            <span className="pedido-producto-nombre">{d.producto?.nombre_producto}</span>
            <span className="pedido-producto-cant">Cantidad: {d.cantidad}</span>
          </div>
        ))}
      </div>

      <div className="pedido-total-section">
        <span className="pedido-total-label">Total</span>
        <span className="pedido-total">{formatPrecio(pedido.total)}</span>
      </div>

      {/* Método de pago con ícono */}
      {metodo && (
        <div className="pedido-metodo-row">
          {metodo.icon}
          <span className="pedido-metodo">{metodo.label}</span>
        </div>
      )}

      <CambiarEstado pedido={pedido} onCambiar={onCambiarEstado} />
    </div>
  )
}