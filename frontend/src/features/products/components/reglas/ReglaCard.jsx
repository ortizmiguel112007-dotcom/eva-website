import { FiPercent, FiDollarSign, FiToggleLeft, FiToggleRight, FiTrash2 } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/products-emprend/reglas/ReglaCard.css"

const CONDICIONES = [
  { value: "siempre",       label: "Siempre activo"           },
  { value: "stock_bajo",    label: "Cuando el stock sea bajo" },
  { value: "stock_menor_a", label: "Cuando stock sea menor a" },
]

export function ReglaCard({ regla: r, onToggle, onEliminar }) {
  const condLabel = CONDICIONES.find(c => c.value === r.condicion)?.label || r.condicion
  const tipoLabel = r.tipo === "porcentaje" ? `${r.valor}%` : formatPrecio(r.valor)

  return (
    <div className={`rd-regla-card ${r.activa ? "activa" : ""}`}>
      <div className="rd-regla-icono">
        {r.tipo === "porcentaje"
          ? <FiPercent    size={18} color={r.activa ? "#3b82f6" : "#94a3b8"} />
          : <FiDollarSign size={18} color={r.activa ? "#3b82f6" : "#94a3b8"} />
        }
      </div>

      <div className="rd-regla-info">
        <div className="rd-regla-nombre-row">
          <p className="rd-regla-nombre">{r.nombre}</p>
          <span className={`rd-regla-badge ${r.activa ? "activa" : "inactiva"}`}>
            {r.activa ? "ACTIVA" : "INACTIVA"}
          </span>
        </div>
        <p className="rd-regla-detalle">
          Descuento: <strong>{tipoLabel}</strong> · Condición: <strong>{condLabel}</strong>
          {r.condicion === "stock_menor_a" && ` (< ${r.stock_limite} unidades)`}
          {r.fecha_fin && ` · Vence: ${new Date(r.fecha_fin).toLocaleDateString("es-CO")}`}
        </p>
      </div>

      <div className="rd-regla-acciones">
        <button className={`rd-btn-toggle ${r.activa ? "activa" : ""}`}
          onClick={() => onToggle(r.id_regla)}
          title={r.activa ? "Desactivar" : "Activar"}>
          {r.activa ? <FiToggleRight size={22} /> : <FiToggleLeft size={22} />}
        </button>
        <button className="rd-btn-eliminar"
          onClick={() => onEliminar(r.id_regla)} title="Eliminar">
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  )
}