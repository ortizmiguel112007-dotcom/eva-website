import { FiPackage, FiCheckCircle, FiAlertTriangle, FiAlertCircle } from "react-icons/fi"
import "@/infrastructure/css/admin/auditoria_inventario/TablaAuditoria.css"

const PAGE_SIZE = 15

function formatPrecio(p) {
  return "$" + Number(p).toLocaleString("es-CO")
}

function getEstado(item) {
  if (item.producto?.tipo === "servicio") return "servicio"
  if (item.cantidad === 0)                return "agotado"
  if (item.cantidad <= item.stock_minimo) return "bajo"
  return "ok"
}

function getPorcentaje(cantidad, stock_maximo) {
  if (!stock_maximo || stock_maximo === 0) return 0
  return Math.min(100, Math.round((cantidad / stock_maximo) * 100))
}

export function TablaAuditoria({ items, pagina }) {
  return (
    <div className="ai-table-wrapper">
      <table className="ai-table">
        <thead>
          <tr>
            {["#", "Producto", "Emprendedora", "Tipo", "Precio", "Cantidad", "Mín / Máx", "Progreso", "Estado"].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={9} className="ai-empty">No hay productos con ese filtro</td>
            </tr>
          ) : items.map((item, idx) => {
            const estado     = getEstado(item)
            const esServicio = item.producto?.tipo === "servicio"
            const porcentaje = esServicio ? 100 : getPorcentaje(item.cantidad, item.stock_maximo)
            const empNombre  = item.producto?.seccion?.emprendedora?.usuario?.nombre || "—"

            return (
              <tr key={item.id_inventario}>
                <td>{(pagina - 1) * PAGE_SIZE + idx + 1}</td>

                <td>
                  <div className="ai-producto-cell">
                    {item.producto?.imagen
                      ? <img src={item.producto.imagen} alt="" className="ai-producto-img" />
                      : <div className="ai-producto-placeholder"><FiPackage size={14} color="#94a3b8" /></div>
                    }
                    <span className="ai-producto-nombre">{item.producto?.nombre_producto || "—"}</span>
                  </div>
                </td>

                <td style={{ fontWeight: 500, color: "#374151" }}>{empNombre}</td>

                <td>
                  <span className={`ai-badge-tipo ${item.producto?.tipo || "producto"}`}>
                    {item.producto?.tipo === "servicio" ? "Servicio" : "Producto"}
                  </span>
                </td>

                <td style={{ fontWeight: 700, color: "#1e293b" }}>
                  {formatPrecio(item.producto?.precio || 0)}
                </td>

                <td>
                  {esServicio
                    ? <span style={{ color: "#94a3b8" }}>—</span>
                    : <span className={`ai-cantidad ${estado}`}>{item.cantidad}</span>
                  }
                </td>

                <td>
                  {esServicio
                    ? <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No aplica</span>
                    : <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        {item.stock_minimo} / {item.stock_maximo}
                      </span>
                  }
                </td>

                <td>
                  {esServicio ? (
                    <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>—</span>
                  ) : (
                    <div className="ai-progreso-wrapper">
                      <div className="ai-progreso-labels">
                        <span>{porcentaje}%</span>
                      </div>
                      <div className="ai-progreso-bar">
                        <div className={`ai-progreso-fill ${estado}`} style={{ width: `${porcentaje}%` }} />
                      </div>
                    </div>
                  )}
                </td>

                <td>
                  {esServicio ? (
                    <span className="ai-badge-estado ok">✦ Servicio</span>
                  ) : (
                    <span className={`ai-badge-estado ${estado}`}>
                      {estado === "ok"
                        ? <><FiCheckCircle size={11} /> OK</>
                        : estado === "bajo"
                        ? <><FiAlertTriangle size={11} /> Stock bajo</>
                        : <><FiAlertCircle size={11} /> Agotado</>
                      }
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}