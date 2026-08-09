// tienda/components/tiendas/TiendaToolbar.jsx
import { FiGrid, FiList } from "react-icons/fi"

import "@/infrastructure/css/tienda/tiendas-perfil/TiendaToolbar.css"

export function TiendaToolbar({ productos, filtroTipo, setFiltroTipo, vista, setVista }) {
  const nProductos = productos.filter(p => p.tipo === "producto").length
  const nServicios = productos.filter(p => p.tipo === "servicio").length

  return (
    <div className="pt-toolbar">
      <div className="pt-filtros">
        {[
          { key: "todos",    label: "Todos",     count: productos.length },
          { key: "producto", label: "Productos", count: nProductos },
          { key: "servicio", label: "Servicios", count: nServicios },
        ].map(f => (
          <button key={f.key}
            className={`pt-filtro-btn ${filtroTipo === f.key ? "active" : ""}`}
            onClick={() => setFiltroTipo(f.key)}
          >
            {f.label} <span className="pt-filtro-count">{f.count}</span>
          </button>
        ))}
      </div>
      <div className="pt-vista-toggle">
        <button className={`pt-vista-btn ${vista === "grid" ? "active" : ""}`} onClick={() => setVista("grid")}>
          <FiGrid size={15} />
        </button>
        <button className={`pt-vista-btn ${vista === "list" ? "active" : ""}`} onClick={() => setVista("list")}>
          <FiList size={15} />
        </button>
      </div>
    </div>
  )
}