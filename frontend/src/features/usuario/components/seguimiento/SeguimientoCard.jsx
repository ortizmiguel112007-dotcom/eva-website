import { FiCalendar, FiCheck, FiTruck, FiStar, FiClock, FiUpload, FiAlertCircle } from "react-icons/fi"
import { formatPrecio, formatFecha } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/usuario/seguimiento/SeguimientoCard.css"

const PASOS = [
  { key: "pago",       label: "Pago"         },
  { key: "proceso",    label: "En preparación" },
  { key: "camino",     label: "En camino"    },
  { key: "entregado",  label: "Entregado"    },
]

const PROGRESO = {
  pendiente_pago:  0,
  pago_enviado:    0,
  pago_rechazado:  0,
  en_proceso:      1,
  enviado:         2,
  entregado:       3,
  cancelado:       -1,
}

const ESTADO_CONFIG = {
  pendiente_pago:  { label: "Pendiente de pago",    cls: "pendiente_pago"  },
  pago_enviado:    { label: "Pago en verificación", cls: "pago_enviado"    },
  pago_rechazado:  { label: "Pago rechazado",       cls: "pago_rechazado"  },
  en_proceso:      { label: "En proceso",           cls: "en_proceso"      },
  enviado:         { label: "Enviado",              cls: "enviado"         },
  entregado:       { label: "Entregado",            cls: "entregado"       },
  cancelado:       { label: "Cancelado",            cls: "cancelado"       },
}

function formatId(id) {
  return `Pedido ORD-${String(id).padStart(3, "0")}`
}

function MensajePago({ estado }) {
  if (estado === "pendiente_pago") return (
    <div className="seg-mensaje pendiente_pago">
      <FiClock size={16} />
      <div className="seg-mensaje-texto">
        Esperando tu comprobante de pago
        <small>Sube tu comprobante para continuar con tu pedido</small>
      </div>
    </div>
  )
  if (estado === "pago_enviado") return (
    <div className="seg-mensaje pago_enviado">
      <FiUpload size={16} />
      <div className="seg-mensaje-texto">
        Comprobante enviado — en verificación
        <small>La emprendedora está revisando tu comprobante</small>
      </div>
    </div>
  )
  if (estado === "pago_rechazado") return (
    <div className="seg-mensaje pago_rechazado">
      <FiAlertCircle size={16} />
      <div className="seg-mensaje-texto">
        Comprobante rechazado
        <small>Por favor sube un nuevo comprobante de pago</small>
      </div>
    </div>
  )
  return null
}

export function SeguimientoCard({ pedido, onResena }) {
  const progresoIdx  = PROGRESO[pedido.estado] ?? 0
  const estadoConfig = ESTADO_CONFIG[pedido.estado] || { label: pedido.estado, cls: "" }
  const cancelado    = pedido.estado === "cancelado"

  return (
    <div className={`seg-card ${cancelado ? "seg-card--cancelado" : ""}`}>

      {/* Header */}
      <div className="seg-card-header">
        <div>
          <p className="seg-card-id">{formatId(pedido.id_pedido)}</p>
          <div className="seg-card-fecha">
            <FiCalendar size={11} />
            <span>Fecha: {formatFecha(pedido.fecha)}</span>
          </div>
        </div>
        <span className={`mp-badge ${estadoConfig.cls}`}>
          {estadoConfig.label}
        </span>
      </div>

      {/* Timeline — solo si no está cancelado */}
      {!cancelado && (
        <div className="seg-progreso">
          <div className="seg-pasos">
            <div className="seg-linea-activa" style={{
              width: progresoIdx === 0 ? 0
                : progresoIdx >= 3 ? "calc(100% - 1.75rem)"
                : `${(progresoIdx / 3) * 100}%`
            }} />
            {PASOS.map((paso, i) => {
              const completado = i < progresoIdx
              const activo     = i === progresoIdx
              return (
                <div key={paso.key} className="seg-paso">
                  <div className={`seg-paso-circulo ${completado ? "completado" : activo ? "activo" : "pendiente"}`}>
                    {completado ? <FiCheck size={12} /> : i + 1}
                  </div>
                  <span className={`seg-paso-label ${completado ? "completado" : activo ? "activo" : ""}`}>
                    {paso.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mensaje de estado de pago */}
      <MensajePago estado={pedido.estado} />

      {/* Mensaje enviado */}
      {pedido.estado === "enviado" && (
        <div className="seg-mensaje enviado">
          <FiTruck size={16} />
          <div className="seg-mensaje-texto">
            Tu pedido está en camino
            <small>Llegaría aproximadamente en los próximos días</small>
          </div>
        </div>
      )}

      {/* Mensaje entregado */}
      {pedido.estado === "entregado" && (
        <>
          <div className="seg-mensaje entregado">
            <FiCheck size={16} />
            <div className="seg-mensaje-texto">
              Pedido entregado exitosamente
              <small>¿Te gustó tu compra? Deja una reseña</small>
            </div>
          </div>
          <button className="seg-btn-resena" onClick={() => onResena(pedido)}>
            <FiStar size={13} /> Dejar reseña
          </button>
        </>
      )}

      {/* Productos */}
      <div className="seg-productos">
        <p className="seg-productos-titulo">Productos en este pedido:</p>
        {pedido.detalles.map(d => (
          <div key={d.id_detalle} className="seg-producto-item">
            <span>{d.cantidad}x {d.producto?.nombre_producto}</span>
            <span>{formatPrecio(d.precio_unit)}</span>
          </div>
        ))}
      </div>

      <div className="seg-total">
        <span>Total del pedido</span>
        <span>{formatPrecio(pedido.total)}</span>
      </div>
    </div>
  )
}