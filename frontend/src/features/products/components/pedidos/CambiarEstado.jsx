import { useState, useEffect, useRef } from "react"
import "@/infrastructure/css/products-emprend/pedidos/CambiarEstado.css"

const TODOS_ESTADOS = [
  { key: "pendiente_pago",  label: "Pendiente Pago"  },
  { key: "pago_enviado",    label: "Pago Enviado"    },
  { key: "pago_rechazado",  label: "Pago Rechazado"  },
  { key: "en_proceso",      label: "En Proceso"      },
  { key: "enviado",         label: "Enviado"         },
  { key: "entregado",       label: "Entregado"       },
  { key: "cancelado",       label: "Cancelado"       },
]

// Transiciones válidas por estado
const TRANSICIONES = {
  pendiente_pago:  ["cancelado"],
  pago_enviado:    ["en_proceso", "pago_rechazado", "cancelado"],
  pago_rechazado:  ["cancelado"],
  en_proceso:      ["enviado", "cancelado"],
  enviado:         ["entregado", "cancelado"],
  entregado:       [],
  cancelado:       [],
}

export function CambiarEstado({ pedido, onCambiar }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const opciones = (TRANSICIONES[pedido.estado] || [])
    .map(key => TODOS_ESTADOS.find(e => e.key === key))
    .filter(Boolean)

  if (opciones.length === 0) return (
    <div className="pedido-cambiar-wrapper">
      <div className={`pedido-cambiar-btn ${pedido.estado} disabled`}>
        <span>
          {pedido.estado === "entregado" ? "✓ Entregado"
           : pedido.estado === "cancelado" ? "✗ Cancelado"
           : "Sin acciones"}
        </span>
      </div>
    </div>
  )

  return (
    <div className="pedido-cambiar-wrapper" ref={ref}>
      <button
        className={`pedido-cambiar-btn ${pedido.estado}`}
        onClick={() => setOpen(prev => !prev)}
      >
        <span>Cambiar estado</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="pedido-cambiar-dropdown">
          {opciones.map(e => (
            <div key={e.key}
              className={`pedido-cambiar-option ${e.key}`}
              onClick={() => { onCambiar(pedido.id_pedido, e.key); setOpen(false) }}
            >
              {e.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}