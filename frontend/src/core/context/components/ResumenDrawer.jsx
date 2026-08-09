import { FiShoppingCart } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"

import "@/infrastructure/css/carrito/ResumenDrawer.css"

export function ResumenDrawer({ total, cupon, onCheckout, onVaciar }) {
  const totalConDescuento = () => {
    if (!cupon) return total
    if (cupon.tipo === "porcentaje") return total * (1 - cupon.valor / 100)
    if (cupon.tipo === "fijo")       return Math.max(0, total - cupon.valor)
    return total
  }

  const totalFinal = totalConDescuento()

  return (
    <div className="drawer-footer">
      <div className="drawer-resumen">
        <div className="drawer-resumen-linea">
          <span>Subtotal</span>
          <span>{formatPrecio(total)}</span>
        </div>
        <div className="drawer-resumen-linea">
          <span>Envío</span>
          <span className="drawer-envio-gratis">Gratis</span>
        </div>
        {cupon && (
          <div className="drawer-resumen-linea descuento">
            <span>Descuento</span>
            <span>-{formatPrecio(total - totalFinal)}</span>
          </div>
        )}
      </div>

      <div className="drawer-total">
        <span>Total</span>
        <span>{formatPrecio(totalFinal)}</span>
      </div>

      <button className="drawer-btn-checkout" onClick={() => onCheckout(totalFinal)}>
        <FiShoppingCart size={15} />
        Proceder al pago — {formatPrecio(totalFinal)}
      </button>
      <button className="drawer-btn-vaciar" onClick={onVaciar}>
        Vaciar carrito
      </button>
    </div>
  )
}