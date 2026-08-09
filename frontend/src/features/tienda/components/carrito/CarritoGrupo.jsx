// tienda/components/carrito/CarritoGrupo.jsx
import { FiPackage } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import { CarritoItem } from "./CarritoItem"
import "@/infrastructure/css/tienda/carrito/CarritoGrupo.css"

export function CarritoGrupo({ grupo, onCambiarCantidad, onQuitar }) {
  const tieneDescuento = grupo.items.some(i => i.descuento);
  return (
    <div className="carrito-grupo">
      <div className="carrito-grupo-header">
        <FiPackage size={13} />
        <span>Tienda de <strong>{grupo.nombre}</strong></span>
        <div className="carrito-grupo-right">
          {tieneDescuento && (
            <span className="carrito-grupo-descuento-badge">🏷 Descuento aplicado</span>
          )}
          <span className="carrito-grupo-subtotal">{formatPrecio(grupo.subtotal)}</span>
        </div>
      </div>
      {grupo.items.map(item => (
        <CarritoItem
          key={item.id_producto}
          item={item}
          onCambiarCantidad={onCambiarCantidad}
          onQuitar={onQuitar}
        />
      ))}
    </div>
  )
}