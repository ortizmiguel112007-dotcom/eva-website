import {
  FiCalendar, FiTrash2, FiToggleLeft, FiToggleRight,
  FiPercent, FiDollarSign, FiCheckCircle, FiXCircle,
  FiClock, FiAlertCircle, FiGift, FiPlus
} from "react-icons/fi"
import { formatFecha } from "@/features/tienda/utils/utils"


import "@/infrastructure/css/products-emprend/cupones/TablaCupones.css"

function getEstadoIcon(estado) {
  const props = { size: 12, style: { flexShrink: 0 } }
  return {
    activo:   <FiCheckCircle  {...props} />,
    inactivo: <FiXCircle      {...props} />,
    expirado: <FiAlertCircle  {...props} />,
    agotado:  <FiClock        {...props} />,
  }[estado] ?? null
}

function getEstadoLabel(estado) {
  return { activo: "Activo", inactivo: "Inactivo", expirado: "Expirado", agotado: "Agotado" }[estado] ?? estado
}

function getFechaClase(fecha_fin) {
  if (!fecha_fin) return ""
  const dias = Math.ceil((new Date(fecha_fin) - new Date()) / (1000 * 60 * 60 * 24))
  if (dias < 0)  return "expirada"
  if (dias <= 7) return "vence-pronto"
  return ""
}

function formatValor(cupon) {
  return cupon.tipo === "porcentaje"
    ? `${Number(cupon.valor)}%`
    : `$${Number(cupon.valor).toLocaleString("es-CO")}`
}

export function TablaCupones({ cupones, getEstado, onToggle, onEliminar, onNuevo }) {
  if (cupones.length === 0) return (
    <div className="cupones-empty">
      <FiGift size={36} style={{ marginBottom: "0.75rem", opacity: 0.35 }} />
      <p>No tienes cupones todavía</p>
      <button className="btn-nuevo-cupon" onClick={onNuevo} style={{ marginTop: "0.75rem" }}>
        <FiPlus size={14} /> Crear primer cupón
      </button>
    </div>
  )

  return (
    <table className="cupones-tabla">
      <thead>
        <tr>
          <th>Código</th>
          <th>Descuento</th>
          <th>Usos</th>
          <th>Vence</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {cupones.map(cupon => {
          const estado = getEstado(cupon)
          const pct    = cupon.limite_usos
            ? Math.min((cupon.usos / cupon.limite_usos) * 100, 100)
            : null

          return (
            <tr key={cupon.id_cupon}>
              <td>
                <span className="cupon-codigo">{cupon.codigo}</span>
                {cupon.descripcion && <div className="cupon-descripcion">{cupon.descripcion}</div>}
              </td>

              <td>
                <span className={`cupon-descuento-pill ${cupon.tipo}`}>
                  {cupon.tipo === "porcentaje" ? <FiPercent size={11} /> : <FiDollarSign size={11} />}
                  {formatValor(cupon)}
                </span>
              </td>

              <td>
                <div className="cupon-usos-wrapper">
                  <span className="cupon-usos-texto">
                    {cupon.usos}
                    {cupon.limite_usos && <span className="cupon-usos-limite"> / {cupon.limite_usos}</span>}
                  </span>
                  {pct !== null && (
                    <div className="cupon-usos-bar">
                      <div className={`cupon-usos-bar-fill ${pct >= 100 ? "lleno" : ""}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              </td>

              <td>
                <span className={`cupon-fecha ${getFechaClase(cupon.fecha_fin)}`}>
                  <FiCalendar size={12} /> {formatFecha(cupon.fecha_fin) || "—"}
                </span>
              </td>

              <td>
                <span className={`cupon-estado ${estado}`}>
                  {getEstadoIcon(estado)} {getEstadoLabel(estado)}
                </span>
              </td>

              <td>
                <div className="cupon-acciones">
                  {estado !== "expirado" && estado !== "agotado" && (
                    <button
                      className={`btn-toggle-cupon ${cupon.activo ? "desactivar" : "activar"}`}
                      onClick={() => onToggle(cupon.id_cupon)}
                      title={cupon.activo ? "Desactivar cupón" : "Activar cupón"}
                    >
                      {cupon.activo ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                      {cupon.activo ? "Desactivar" : "Activar"}
                    </button>
                  )}
                  <button className="btn-eliminar-cupon"
                    onClick={() => onEliminar(cupon.id_cupon)} title="Eliminar cupón">
                    <FiTrash2 size={13} /> Eliminar
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}