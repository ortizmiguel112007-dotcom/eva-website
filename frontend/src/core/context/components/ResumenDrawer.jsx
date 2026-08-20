import { useCarrito } from "@/core/context/CarritoContext"
import { formatPrecio } from "@/features/tienda/utils/utils"
import { FiShoppingCart } from "react-icons/fi"

export function ResumenDrawer({ total, onCheckout, onVaciar }) {
  const { carrito: items, cupon } = useCarrito()

  const calcularTotales = () => {
    if (!cupon) return { totalFinal: total, descuentoTotal: 0 }

    const idsSeccionCupon = cupon.secciones_aplicables || []
    const porSeccion = {}
    items.forEach(i => {
      porSeccion[i.id_seccion] = (porSeccion[i.id_seccion] || 0) + Number(i.precio) * i.cantidad
    })

    let totalFinal = 0
    let descuentoTotal = 0
    Object.entries(porSeccion).forEach(([idSeccion, subtotal]) => {
      let sub = subtotal
      if (idsSeccionCupon.includes(Number(idSeccion))) {
        const desc = cupon.tipo === "porcentaje"
          ? sub * (Number(cupon.valor) / 100)
          : Math.min(Number(cupon.valor), sub)
        descuentoTotal += desc
        sub -= desc
      }
      totalFinal += sub
    })

    return { totalFinal, descuentoTotal }
  }

  const { totalFinal, descuentoTotal } = calcularTotales()
  const cuponAplica = descuentoTotal > 0

  return (
    <div className="drawer-resumen">
      {cuponAplica && (
        <>
          <div className="drawer-resumen-linea"><span>Subtotal</span><span>{formatPrecio(total)}</span></div>
          <div className="drawer-resumen-linea descuento">
            <span>Descuento</span>
            <span>-{formatPrecio(descuentoTotal)}</span>
          </div>
        </>
      )}
      <div className="drawer-resumen-linea total">
        <span>Total</span>
        <span>{formatPrecio(totalFinal)}</span>
      </div>
      <button className="btn-ir-checkout" onClick={onCheckout}>
        <FiShoppingCart size={15} /> Ir a pagar
      </button>
      <button className="btn-vaciar-drawer" onClick={onVaciar}>Vaciar carrito</button>
    </div>
  )
}