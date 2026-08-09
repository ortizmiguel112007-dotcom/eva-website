import { FiSearch, FiX, FiPackage } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"

import "@/infrastructure/css/products-emprend/reglas/PanelProductos.css"

export function PanelProductos({ productos, productoSel, cargando, busqueda, setBusqueda, onSeleccionar }) {
  const filtrados = productos.filter(p =>
    p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="rd-panel-productos">
      <div className="rd-panel-header">
        <p className="rd-panel-label">Selecciona un producto</p>
        <div className="rd-search">
          <FiSearch size={13} color="#94a3b8" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar producto..." />
          {busqueda && (
            <button className="rd-search-clear" onClick={() => setBusqueda("")}>
              <FiX size={13} color="#94a3b8" />
            </button>
          )}
        </div>
      </div>

      <div className="rd-productos-lista">
        {cargando ? (
          <p className="rd-cargando" style={{ padding: "1rem" }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p className="rd-cargando" style={{ padding: "1rem" }}>Sin productos</p>
        ) : filtrados.map(p => (
          <div key={p.id_producto}
            className={`rd-producto-item ${productoSel?.id_producto === p.id_producto ? "activo" : ""}`}
            onClick={() => onSeleccionar(p)}>
            {p.imagen
              ? <img src={p.imagen} alt="" className="rd-producto-img" />
              : <div className="rd-producto-placeholder"><FiPackage size={16} color="#94a3b8" /></div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="rd-producto-nombre">{p.nombre_producto}</p>
              <p className="rd-producto-precio">{formatPrecio(p.precio)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}