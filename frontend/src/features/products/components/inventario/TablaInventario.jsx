import { FiEdit } from "react-icons/fi"
import "@/infrastructure/css/products-emprend/inventario/TablaInventario.css"

function getEstado(item) {
  if (item.tipo === "servicio") return "servicio"
  if (item.cantidad === 0) return "vacio"
  if (item.cantidad <= item.stock_minimo) return "bajo"
  return "ok"
}

function getPorcentaje(cantidad, stock_maximo) {
  if (!stock_maximo || stock_maximo === 0) return 0
  return Math.min(100, Math.round((cantidad / stock_maximo) * 100))
}

export function TablaInventario({ items, onEditar, onVerHistorial }) {
  return (
    <div className="inventario-tabla-wrapper">
      <table className="inventario-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Mín / Máx</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className="inv-empty">No hay productos en el inventario</div>
              </td>
            </tr>
          ) : items.map(item => {
            const estado = getEstado(item)
            const esServicio = item.tipo === "servicio"
            const porcentaje = esServicio ? 100 : getPorcentaje(item.cantidad, item.stock_maximo)

            return (
              <tr key={item.id_producto}>
                <td>
                  <div className="inv-producto-info">
                    {item.imagen
                      ? <img src={item.imagen} alt={item.nombre} className="inv-producto-img" />
                      : <div className="inv-producto-sin-img">{esServicio ? "✂️" : "📦"}</div>
                    }
                    <div>
                      <div className="inv-producto-nombre">
                        {item.nombre}
                        {item.es_alianza && (
                          <span className="inv-badge-alianza">Alianza</span>
                        )}
                      </div>
                      <div className="inv-producto-categoria">
                        {item.es_alianza && item.nombre_seccion
                          ? item.nombre_seccion
                          : item.categoria || "Sin categoría"}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  {esServicio
                    ? <span className="inv-cantidad-num ok">—</span>
                    : <span className={`inv-cantidad-num ${estado}`}>{item.cantidad}</span>
                  }
                </td>

                <td>
                  {esServicio ? (
                    <span className="inv-no-aplica">No aplica</span>
                  ) : (
                    <div className="inv-progreso-wrapper">
                      <div className="inv-progreso-labels">
                        <span>Min: {item.stock_minimo}</span>
                        <span>Max: {item.stock_maximo}</span>
                      </div>
                      <div className="inv-progreso-bar">
                        <div className={`inv-progreso-fill ${estado}`} style={{ width: `${porcentaje}%` }} />
                      </div>
                    </div>
                  )}
                </td>

                <td>
                  {esServicio ? (
                    <span className="badge-alerta servicio">✦ Servicio</span>
                  ) : (
                    <span className={`badge-alerta ${estado}`}>
                      {estado === "vacio" ? "⊗ Sin Stock"
                        : estado === "bajo" ? "⚠ Stock Bajo"
                          : "✓ Stock OK"}
                    </span>
                  )}
                </td>

                <td>
                  {esServicio ? (
                    <button className="btn-editar-stock" disabled style={{ opacity: 0.4, cursor: "not-allowed" }}>
                      <FiEdit size={13} /> No aplica
                    </button>
                  ) : (
                    <div className="inv-acciones">                                        
                      <button className="btn-editar-stock" onClick={() => onEditar(item)}>
                        <FiEdit size={13} /> Editar
                      </button>
                      <button className="btn-historial-stock" onClick={() => onVerHistorial(item)}> 
                        Historial
                      </button>
                    </div>
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