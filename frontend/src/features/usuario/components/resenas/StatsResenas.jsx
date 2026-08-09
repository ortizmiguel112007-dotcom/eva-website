import { FiStar, FiMessageSquare } from "react-icons/fi"
import "@/infrastructure/css/usuario/resenas/StatsResenas.css"

export function StatsResenas({ resenas, filtro, setFiltro }) {
  const contPorEstrella = [5, 4, 3, 2, 1].map(n => ({
    n, count: resenas.filter(r => r.calificacion === n).length
  }))

  return (
    <aside className="mr-sidebar">
      <div className="mr-stats-card">
        <p className="mr-stats-titulo">Distribución</p>
        {contPorEstrella.map(({ n, count }) => (
          <div key={n} className="mr-bar-row"
            onClick={() => setFiltro(filtro === n ? 0 : n)}
            style={{ cursor: "pointer", opacity: filtro !== 0 && filtro !== n ? 0.4 : 1 }}
          >
            <span className="mr-bar-num">{n}</span>
            <FiStar size={11} fill="#f59e0b" color="#f59e0b" />
            <div className="mr-bar-track">
              <div className="mr-bar-fill"
                style={{ width: resenas.length ? `${(count / resenas.length) * 100}%` : "0%" }} />
            </div>
            <span className="mr-bar-count">{count}</span>
          </div>
        ))}
        {filtro !== 0 && (
          <button className="mr-btn-limpiar" onClick={() => setFiltro(0)}>
            Mostrar todas
          </button>
        )}
      </div>

      <div className="mr-total-card">
        <FiMessageSquare size={20} color="#6366f1" />
        <strong>{resenas.length}</strong>
        <span>reseña{resenas.length !== 1 ? "s" : ""} publicada{resenas.length !== 1 ? "s" : ""}</span>
      </div>
    </aside>
  )
}