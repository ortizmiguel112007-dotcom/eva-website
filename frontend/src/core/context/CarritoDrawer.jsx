import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCarrito } from "@/core/context/CarritoContext"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import { FiX, FiShoppingCart, FiMinus, FiPlus, FiTrash2, FiTag } from "react-icons/fi"
import "@/infrastructure/css/carritoDrawer.css"

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO")
}

export default function CarritoDrawer() {
  const navigate  = useNavigate()
  const { token } = useAuth()
  const {
    carrito: items,
    quitarDelCarrito: quitar,
    cambiarCantidad,
    vaciarCarrito: vaciar,
    totalPrecio: total,
    totalItems,
    carritoAbierto,
    setCarritoAbierto
  } = useCarrito()

  const [codigoCupon, setCodigoCupon] = useState("")
  const [cupon, setCupon]             = useState(null)
  const [cuponError, setCuponError]   = useState("")

  if (!carritoAbierto) return null

  const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) return
    setCuponError("")
    setCupon(null)
    try {
      const res = await axios.post(
        "http://localhost:3000/api/cupones/validar",
        { codigo: codigoCupon },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCupon(res.data.cupon)
    } catch (err) {
      setCuponError(err.response?.data?.error || "Cupón inválido")
    }
  }

  const totalConDescuento = () => {
    if (!cupon) return total
    if (cupon.tipo === "porcentaje") return total * (1 - cupon.valor / 100)
    if (cupon.tipo === "fijo")       return Math.max(0, total - cupon.valor)
    return total
  }

  const handleCheckout = () => {
    setCarritoAbierto(false)
    navigate("/carrito")
  }

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={() => setCarritoAbierto(false)} />

      {/* Panel */}
      <div className="drawer-panel">

        {/* Header */}
        <div className="drawer-header">
          <h3 className="drawer-titulo">
            <FiShoppingCart />
            Mi Carrito
            {totalItems > 0 && <span className="drawer-badge">{totalItems}</span>}
          </h3>
          <button className="drawer-cerrar" onClick={() => setCarritoAbierto(false)}>
            <FiX size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-vacio">
              {/* <FiShoppingCart size={40} color="#cbd5e1" /> */}
              <p>Tu carrito está vacío</p>
              <small>Agrega productos para comenzar</small>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id_producto} className="drawer-item">

                {/* Imagen */}
                {item.imagen
                  ? <img src={item.imagen} alt={item.nombre_producto} className="drawer-item-img" />
                  : <div className="drawer-item-placeholder"><FiShoppingCart size={16} color="#94a3b8" /></div>
                }

                {/* Info */}
                <div className="drawer-item-info">
                  <p className="drawer-item-nombre">{item.nombre_producto}</p>
                  <span className="drawer-item-precio">
                    {formatPrecio(Number(item.precio) * item.cantidad)}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {formatPrecio(item.precio)} c/u
                  </span>
                </div>

                {/* Acciones */}
                <div className="drawer-item-acciones">
                  <div className="drawer-cant">
                    <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}>
                      <FiMinus size={11} />
                    </button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}>
                      <FiPlus size={11} />
                    </button>
                  </div>
                  <button className="drawer-quitar" onClick={() => quitar(item.id_producto)}>
                    <FiTrash2 size={12} />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="drawer-footer">

            {/* Cupón */}
            <div className="drawer-cupon">
              <input
                type="text"
                placeholder="Código de cupón"
                value={codigoCupon}
                onChange={e => setCodigoCupon(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleAplicarCupon()}
              />
              <button onClick={handleAplicarCupon} title="Aplicar cupón">
                <FiTag size={14} />
              </button>
            </div>
            {cupon && (
              <p className="drawer-cupon-ok">
                ✓ {cupon.tipo === "porcentaje" ? `${cupon.valor}% de descuento` : `${formatPrecio(cupon.valor)} de descuento`}
              </p>
            )}
            {cuponError && <p className="drawer-cupon-error">⚠️ {cuponError}</p>}

            {/* Resumen */}
            <div className="drawer-resumen">
              <div className="drawer-resumen-linea">
                <span>Subtotal</span>
                <span>{formatPrecio(total)}</span>
              </div>
              <div className="drawer-resumen-linea">
                <span>Envío</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Gratis</span>
              </div>
              {cupon && (
                <div className="drawer-resumen-linea descuento">
                  <span>Descuento</span>
                  <span>-{formatPrecio(total - totalConDescuento())}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="drawer-total">
              <span>Total</span>
              <span>{formatPrecio(totalConDescuento())}</span>
            </div>

            {/* Botones */}
            <button className="drawer-btn-checkout" onClick={handleCheckout}>
              <FiShoppingCart size={15} />
              Proceder al pago — {formatPrecio(totalConDescuento())}
            </button>
            <button className="drawer-btn-vaciar" onClick={vaciar}>
              Vaciar carrito
            </button>

          </div>
        )}

      </div>
    </>
  )
}