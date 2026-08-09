import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCarrito } from "@/core/context/CarritoContext"
import { FiX, FiShoppingCart } from "react-icons/fi"

import { CarritoItem }   from "./components/CarritoItem"
import { CuponDrawer }   from "./components/CuponDrawer"
import { ResumenDrawer } from "./components/ResumenDrawer"

import "@/infrastructure/css/carrito/CarritoDrawer.css"

export default function CarritoDrawer() {
  const navigate = useNavigate()
  const {
    carrito: items,
    quitarDelCarrito:  quitar,
    cambiarCantidad,
    vaciarCarrito:     vaciar,
    totalPrecio:       total,
    totalItems,
    carritoAbierto,
    setCarritoAbierto,
  } = useCarrito()

  const [cupon, setCupon] = useState(null)

  if (!carritoAbierto) return null

  const handleCheckout = () => { setCarritoAbierto(false); navigate("/carrito") }

  return (
    <>
      <div className="drawer-overlay" onClick={() => setCarritoAbierto(false)} />

      <div className="drawer-panel">
        {/* ── Header ── */}
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

        {/* ── Body ── */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-vacio">
              <p>Tu carrito está vacío</p>
              <small>Agrega productos para comenzar</small>
            </div>
          ) : items.map(item => (
            <CarritoItem
              key={item.id_producto}
              item={item}
              onCambiarCantidad={cambiarCantidad}
              onQuitar={quitar}
            />
          ))}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <>
            <CuponDrawer onCuponAplicado={setCupon} />
            <ResumenDrawer
              total={total}
              cupon={cupon}
              onCheckout={handleCheckout}
              onVaciar={vaciar}
            />
          </>
        )}
      </div>
    </>
  )
}