import { FiSearch, FiX } from "react-icons/fi"
import "@/infrastructure/css/admin/auditoria_inventario/FiltrosAuditoria.css"

export function FiltrosAuditoria({
  busqueda, setBusqueda,
  filtroEstado, setFiltroEstado,
  filtroEmp, setFiltroEmp,
  emprendedoras,
}) {
  return (
    <div className="ai-filtros">
      <div className="ai-search">
        <FiSearch size={14} color="#94a3b8" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por producto o emprendedora..."
        />
        {busqueda && (
          <button className="ai-search-clear" onClick={() => setBusqueda("")}>
            <FiX size={13} color="#94a3b8" />
          </button>
        )}
      </div>

      <select
        className="ai-select"
        value={filtroEstado}
        onChange={e => setFiltroEstado(e.target.value)}
      >
        <option value="todos">Todos los estados</option>
        <option value="ok">Stock OK</option>
        <option value="bajo">Stock bajo</option>
        <option value="agotado">Agotados</option>
        <option value="servicio">Servicios</option>
      </select>

      <select
        className="ai-select"
        value={filtroEmp}
        onChange={e => setFiltroEmp(e.target.value)}
      >
        <option value="todas">Todas las emprendedoras</option>
        {emprendedoras.map(e => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>
    </div>
  )
}