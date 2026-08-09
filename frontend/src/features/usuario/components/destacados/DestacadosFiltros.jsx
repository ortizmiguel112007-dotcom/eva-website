import { FiFilter } from "react-icons/fi"
import "@/infrastructure/css/usuario/destacados/DestacadosFiltros.css"

export function DestacadosFiltros({ categorias, catActiva, setCatActiva }) {
  if (categorias.length <= 1) return null
  return (
    <div className="du-filtros">
      <FiFilter size={13} color="#94a3b8" />
      {categorias.map(cat => (
        <button key={cat}
          className={`du-filtro-btn ${catActiva === cat ? "active" : ""}`}
          onClick={() => setCatActiva(cat)}
        >
          {cat === "Todos" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  )
}