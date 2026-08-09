// usuario/components/dashboard/SeccionDashboard.jsx
import { FiArrowRight } from "react-icons/fi"

export function SeccionDashboard({ titulo, onVerTodos, children }) {
  return (
    <section className="ud-section">
      <div className="ud-section-header">
        <h2>{titulo}</h2>
        {onVerTodos && (
          <button className="ud-ver-todos" onClick={onVerTodos}>
            Ver todos <FiArrowRight size={14} />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}