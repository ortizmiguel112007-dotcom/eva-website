import { FiPackage, FiEye, FiEyeOff, FiStar, FiCheck, FiTrash2 } from "react-icons/fi"
import { formatPrecio } from "@/features/admin/utils/utils"
import "@/infrastructure/css/admin/productos/TablaProductosAdmin.css"

const PAGE_SIZE = 10

export function TablaProductosAdmin({
  productos, pagina,
  onToggleVisible, onToggleDestacado,
  onAprobar, onRechazar, onEliminar   // 🆕
}) {
  return (
    <div className="ap-table-wrapper">
      <table className="ap-table">
        <thead>
          <tr>
            {["#", "Producto", "Emprendedora", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr><td colSpan={8} className="ap-empty">No hay productos</td></tr>
          ) : productos.map((p, i) => {
            const stock      = p.inventario?.cantidad ?? null
            const pendiente  = p.estado_producto === "pendiente"
            return (
              <tr key={p.id_producto}>
                <td>{(pagina - 1) * PAGE_SIZE + i + 1}</td>

                <td>
                  <div className="ap-producto-cell">
                    {p.imagen
                      ? <img src={p.imagen} alt="" className="ap-producto-img" />
                      : <div className="ap-producto-placeholder"><FiPackage size={16} color="#94a3b8" /></div>
                    }
                    <span className="ap-producto-nombre">{p.nombre_producto}</span>
                  </div>
                </td>

                <td>{p.seccion?.emprendedora?.usuario?.nombre || "—"}</td>
                <td>{p.categoria || "—"}</td>
                <td className="ap-precio">{formatPrecio(p.precio)}</td>

                <td>
                  <span className={`ap-stock-badge ${stock === 0 ? "agotado" : "disponible"}`}>
                    {stock ?? "—"}
                  </span>
                </td>

                <td>
                  <span className={`ap-estado-badge ${
                    pendiente ? "pendiente" : p.visible ? "visible" : "oculto"
                  }`}>
                    {pendiente ? "Pendiente" : p.visible ? "Visible" : "Oculto"}
                  </span>
                </td>

                <td>
                  <div className="ap-acciones">
                    {pendiente ? (
                      <>
                        <button className="ap-btn-accion ap-btn--aprobar"
                          onClick={() => onAprobar(p.id_producto)}>
                          <FiCheck size={13} /> Aprobar
                        </button>
                        <button className="ap-btn-accion ap-btn--rechazar"
                          onClick={() => onRechazar(p)}>
                          <FiTrash2 size={13} /> Rechazar
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="ap-btn-accion"
                          onClick={() => onToggleVisible(p.id_producto, p.visible)}>
                          {p.visible ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                          {p.visible ? "Ocultar" : "Mostrar"}
                        </button>
                        <button className="ap-btn-accion ap-btn--eliminar"
                          onClick={() => onEliminar(p)}>
                          <FiTrash2 size={13} /> Eliminar
                        </button>
                        <button className={`ap-btn-accion ${p.destacado ? "destacado" : ""}`}
                          onClick={() => onToggleDestacado(p.id_producto, p.destacado)}>
                          <FiStar size={13} fill={p.destacado ? "#f59e0b" : "none"} color={p.destacado ? "#f59e0b" : "#374151"} />
                          {p.destacado ? "Quitar" : "Destacar"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}