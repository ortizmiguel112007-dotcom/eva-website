import { FiClock, FiCheck, FiX } from "react-icons/fi"
import "@/infrastructure/css/usuario/historialpagos/FiltrosPagos.css"

export const ESTADO = {
  sin_comprobante: { label: "Sin comprobante", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", Icon: FiClock },
  pendiente:       { label: "Pendiente",        color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", Icon: FiClock },
  verificado:      { label: "Verificado",       color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7", Icon: FiCheck },
  rechazado:       { label: "Rechazado",        color: "#ef4444", bg: "#fef2f2", border: "#fecaca", Icon: FiX    },
}


export function FiltrosPagos({ pedidos, filtro, setFiltro }) {
  return (
    <div className="hp-filtros">
      {["todos", "sin_comprobante", "pendiente", "verificado", "rechazado"].map(f => {
        const est   = ESTADO[f]
        const count = f === "todos"
          ? pedidos.length
          : f === "sin_comprobante"
            ? pedidos.filter(p => !p.pago).length
            : pedidos.filter(p => p.pago?.estado === f).length
        return (
          <button key={f}
            className={`hp-filtro-btn ${filtro === f ? "active" : ""}`}
            onClick={() => setFiltro(f)}
            style={filtro === f && f !== "todos"
              ? { background: est?.bg, color: est?.color, borderColor: est?.border }
              : {}}
          >
            {f === "todos" ? "Todos" : est?.label}
            <span className="hp-filtro-count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}