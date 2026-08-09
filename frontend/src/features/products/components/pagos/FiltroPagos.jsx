import "@/infrastructure/css/products-emprend/pagos/FiltroPagos.css"

const ESTADO_BADGE = {
  pendiente: { label: "Pendiente" },
  aprobado:  { label: "Aprobado"  },
  rechazado: { label: "Rechazado" },
}

export function FiltroPagos({ pagos, filtro, setFiltro }) {
  return (
    <div className="pagos-filtros">
      {["todos", "pendiente", "aprobado", "rechazado"].map(f => (
        <button key={f}
          className={`pagos-filtro-btn ${filtro === f ? "active" : ""}`}
          onClick={() => setFiltro(f)}
        >
          {f === "todos" ? "Todos" : ESTADO_BADGE[f]?.label}
          {f !== "todos" && (
            <span className="pagos-filtro-count">
              ({pagos.filter(p => p.estado === f).length})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}