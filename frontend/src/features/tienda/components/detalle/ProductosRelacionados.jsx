import { useNavigate } from "react-router-dom"
import { FiPackage, FiShoppingCart } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import { useCarrito } from "@/core/context/CarritoContext" 

import "@/infrastructure/css/tienda/detalle/ProductosRelacionados.css"

export function ProductosRelacionados({ relacionados, onToast }) {
  const navigate = useNavigate()
  const { agregarAlCarrito } = useCarrito()

  if (!relacionados.length) return null

  return (
    <div className="dp-seccion">
      <div className="dp-seccion-header">
        <h2 className="dp-seccion-titulo">
          <FiPackage size={18} /> Productos Relacionados
        </h2>
      </div>
      <div className="dp-relacionados-grid">
        {relacionados.map(p => (
          <div
            key={p.id_producto}
            className="dp-rel-card"
            onClick={() => navigate(`/producto/${p.id_producto}`)}
          >
            <div className="dp-rel-img">
              {p.imagen
                ? <img src={p.imagen} alt={p.nombre_producto} />
                : <div className="dp-rel-no-img"><FiPackage size={28} color="#cbd5e1" /></div>
              }
              <span className={`dp-badge dp-badge--${p.tipo}`}>{p.tipo}</span>
            </div>
            <div className="dp-rel-body">
              <span className="dp-rel-cat">{p.categoria}</span>
              <h4 className="dp-rel-nombre">{p.nombre_producto}</h4>
              <div className="dp-rel-footer">
                <span className="dp-rel-precio">{formatPrecio(p.precio)}</span>
                <button
                  className="dp-rel-btn"
                  onClick={e => {
                    e.stopPropagation()
                    agregarAlCarrito({
                      id_producto: p.id_producto, nombre_producto: p.nombre_producto,
                      precio: p.precio, imagen: p.imagen, categoria: p.categoria,
                    })
                    onToast(`${p.nombre_producto} agregado`)
                  }}
                >
                  <FiShoppingCart size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}