import { FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/carrito/CarritoItem.css"

export function CarritoItem({ item, onCambiarCantidad, onQuitar }) {
  return (
    <div className="drawer-item">
      {item.imagen
        ? <img src={item.imagen} alt={item.nombre_producto} className="drawer-item-img" />
        : <div className="drawer-item-placeholder"><FiShoppingCart size={16} color="#94a3b8" /></div>
      }

      <div className="drawer-item-info">
        <p className="drawer-item-nombre">{item.nombre_producto}</p>

        {/* Precio unitario */}
        <div className="drawer-item-unit-row">
          {item.descuento && (
            <span className="drawer-item-original">{formatPrecio(item.precio_original)}</span>
          )}
          <span className="drawer-item-unit">{formatPrecio(item.precio)} c/u</span>
        </div>
      </div>

      <div className="drawer-item-right">
        {/* Cantidad */}
        <div className="carrito-cantidad">
          <button onClick={() => onCambiarCantidad(item.id_producto, item.cantidad - 1)}>
            <FiMinus size={12} />
          </button>
          <span>{item.cantidad}</span>
          <button onClick={() => onCambiarCantidad(item.id_producto, item.cantidad + 1)}>
            <FiPlus size={12} />
          </button>
        </div>

        {/* Total item */}
        <div className="drawer-item-total">
          {item.descuento && (
            <span className="carrito-item-precio-original">
              {formatPrecio(Number(item.precio_original) * item.cantidad)}
            </span>
          )}
          <span className="carrito-item-precio">
            {formatPrecio(Number(item.precio) * item.cantidad)}
          </span>
        </div>
      </div>
    </div>
  )
}