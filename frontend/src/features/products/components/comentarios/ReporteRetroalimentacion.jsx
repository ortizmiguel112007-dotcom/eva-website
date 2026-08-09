import { FiStar, FiUsers, FiTrendingUp, FiTrendingDown } from "react-icons/fi"
import "@/infrastructure/css/products-emprend/comentarios/ReporteRetroalimentacion.css"

export function ReporteRetroalimentacion({ reporte }) {
  if (!reporte) return null
  const { resumen, por_producto, mejor_calificado, peor_calificado, conversion } = reporte

  return (
    <div className="reporte-container">
      <div className="reporte-metricas">
        <div className="reporte-metrica">
          <FiStar size={18} color="#f59e0b" />
          <div>
            <strong>{resumen.promedio_global || "—"}</strong>
            <span>Promedio general</span>
          </div>
        </div>
        <div className="reporte-metrica">
          <FiUsers size={18} color="#2563eb" />
          <div>
            <strong>{resumen.total_comentarios}</strong>
            <span>Reseñas totales</span>
          </div>
        </div>
        <div className="reporte-metrica">
          <FiUsers size={18} color="#16a34a" />
          <div>
            <strong>{resumen.clientes_que_resenaron}</strong>
            <span>Clientes distintos</span>
          </div>
        </div>
        <div className="reporte-metrica">
          <FiTrendingUp size={18} color="#7c3aed" />
          <div>
            <strong>{conversion.tasa_porcentaje}%</strong>
            <span>Pedidos con reseña ({conversion.pedidos_con_resena}/{conversion.pedidos_entregados})</span>
          </div>
        </div>
      </div>

      <div className="reporte-distribucion">
        <h3>Distribución de calificaciones</h3>
        {[5, 4, 3, 2, 1].map((n) => {
          const cantidad = resumen.distribucion_estrellas[n] || 0
          const pct = resumen.total_comentarios ? (cantidad / resumen.total_comentarios) * 100 : 0
          return (
            <div key={n} className="reporte-barra-row">
              <span className="reporte-barra-label">{n} ★</span>
              <div className="reporte-barra-track">
                <div className="reporte-barra-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="reporte-barra-num">{cantidad}</span>
            </div>
          )
        })}
      </div>

      {(mejor_calificado || peor_calificado) && (
        <div className="reporte-destacados">
          {mejor_calificado && (
            <div className="reporte-destacado reporte-destacado--top">
              <FiTrendingUp size={16} />
              <div>
                <p className="reporte-destacado-label">Mejor calificado</p>
                <strong>{mejor_calificado.nombre_producto}</strong>
                <span>{mejor_calificado.promedio} ★ ({mejor_calificado.total_comentarios} reseñas)</span>
              </div>
            </div>
          )}
          {peor_calificado && peor_calificado.id_producto !== mejor_calificado?.id_producto && (
            <div className="reporte-destacado reporte-destacado--bottom">
              <FiTrendingDown size={16} />
              <div>
                <p className="reporte-destacado-label">Necesita atención</p>
                <strong>{peor_calificado.nombre_producto}</strong>
                <span>{peor_calificado.promedio} ★ ({peor_calificado.total_comentarios} reseñas)</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="reporte-tabla">
        <h3>Reseñas por producto</h3>
        {por_producto.length === 0 ? (
          <p className="reporte-vacio">Aún no hay reseñas registradas</p>
        ) : (
          <table>
            <thead>
              <tr><th>Producto</th><th>Reseñas</th><th>Promedio</th></tr>
            </thead>
            <tbody>
              {por_producto.map((p) => (
                <tr key={p.id_producto}>
                  <td>{p.nombre_producto}</td>
                  <td>{p.total_comentarios}</td>
                  <td>{p.promedio} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}