import { FiSearch } from "react-icons/fi"

import "@/infrastructure/css/products-emprend/destacados/FiltrosDestacados.css"

export function FiltrosDestacados({ busqueda, setBusqueda, filtro, setFiltro }) {
  return (
    <div className="destacados-filtros">
      <div className="destacados-search-wrapper">
        <FiSearch className="destacados-search-icon" />
        <input type="text" className="destacados-search"
          placeholder="Buscar productos o servicios..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
        />
      </div>
      {["todos", "destacados", "normales"].map(f => (
        <button key={f}
          className={`destacados-pill ${filtro === f ? "active" : ""}`}
          onClick={() => setFiltro(f)}
        >
          {f === "todos" ? "Todos" : f === "destacados" ? "Destacados" : "Sin Destacar"}
        </button>
      ))}
    </div>
  )
}