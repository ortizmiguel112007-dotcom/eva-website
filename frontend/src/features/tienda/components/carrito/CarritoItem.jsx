// tienda/components/carrito/CarritoItem.jsx
import { FiPackage, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/tienda/carrito/CarritoItem.css"

export function CarritoItem({ item, onCambiarCantidad, onQuitar }) {
  return (
    <div className="carrito-item-card">
      {item.imagen
        ? <img src={item.imagen} alt={item.nombre_producto} className="carrito-item-img" />
        : <div className="carrito-item-placeholder"><FiPackage size={20} color="#94a3b8" /></div>
      }
      <div className="carrito-item-info">
        <h3 className="carrito-item-nombre">{item.nombre_producto}</h3>
        <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{item.categoria}</p>
        <div className="carrito-item-acciones">
          <div className="carrito-cantidad">
            <button onClick={() => onCambiarCantidad(item.id_producto, item.cantidad - 1)}>
              <FiMinus size={12} />
            </button>
            <span>{item.cantidad}</span>
            <button onClick={() => onCambiarCantidad(item.id_producto, item.cantidad + 1)}>
              <FiPlus size={12} />
            </button>
          </div>
          <span className="carrito-item-precio">
            {formatPrecio(Number(item.precio) * item.cantidad)}
          </span>
        </div>
      </div>
      <button className="btn-quitar-item" onClick={() => onQuitar(item.id_producto)}>
        <FiTrash2 size={13} />
      </button>
    </div>
  )
}