import { FiSearch, FiX } from "react-icons/fi"

export function FiltrosComentarios({ busqueda, setBusqueda, filtro, setFiltro }) {
  return (
    <div className="ar-filtros">
      <div className="ar-search">
        <FiSearch size={14} color="#94a3b8" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por texto, usuario o producto..."
          className="ar-search-input"
        />
        {busqueda && (
          <button onClick={() => setBusqueda("")} className="ar-search-clear">
            <FiX size={13} />
          </button>
        )}
      </div>
      <select value={filtro} onChange={e => setFiltro(e.target.value)} className="ar-select">
        <option value="todos">Todos</option>
        <option value="activos">Activos</option>
        <option value="ocultos">Ocultos</option>
      </select>
    </div>
  )
}