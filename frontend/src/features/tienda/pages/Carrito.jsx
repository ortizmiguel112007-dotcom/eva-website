import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCarrito } from "@/core/context/CarritoContext"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import "@/infrastructure/css/carrito.css"
import "@/infrastructure/css/inicio.css"

const METODOS_PAGO = [
  { value: "transferencia", label: "Transferencia bancaria", icono: "🏦" },
  { value: "qr",            label: "Pago QR",               icono: "📱" },
  { value: "efectivo",      label: "Efectivo",               icono: "💵" },
]

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO")
}

export default function Carrito() {
  const navigate  = useNavigate()
  const { token } = useAuth()
  const { items, quitar, cambiarCantidad, vaciar, total, totalItems } = useCarrito()

  const [metodoPago, setMetodoPago]   = useState("")
  const [nota, setNota]               = useState("")
  const [codigoCupon, setCodigoCupon] = useState("")
  const [cupon, setCupon]             = useState(null)
  const [cuponError, setCuponError]   = useState("")
  const [confirmando, setConfirmando] = useState(false)
  const [pedidoExito, setPedidoExito] = useState(null)
  const [toast, setToast]             = useState(null)

  const mostrarToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

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

  const handleConfirmar = async () => {
    if (!token) {
      navigate("/login")
      return
    }
    if (!metodoPago) {
      mostrarToast("⚠️ Selecciona un método de pago")
      return
    }
    if (items.length === 0) return

    setConfirmando(true)
    try {
      const res = await axios.post(
        "http://localhost:3000/api/cliente/pedidos",
        {
          items: items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
          metodo_pago: metodoPago,
          nota,
          id_cupon: cupon?.id_cupon || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      vaciar()
      setPedidoExito(res.data.pedido)
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al confirmar pedido")
    } finally {
      setConfirmando(false)
    }
  }

  // ── Pantalla de éxito ──
  if (pedidoExito) {
    return (
      <div className="carrito-page">
        <div className="carrito-wrapper">
          <div className="pedido-exito">
            <div className="pedido-exito-icono">🎉</div>
            <h2>¡Pedido confirmado!</h2>
            <p>
              Tu pedido <strong>#{pedidoExito.id_pedido}</strong> fue registrado correctamente.
              La emprendedora lo procesará pronto.
            </p>
            <div className="pedido-exito-acciones">
              <button
                className="btn-hero-secondary"
                style={{ color: '#1e293b', borderColor: '#e5e7eb' }}
                onClick={() => navigate("/")}
              >
                Seguir comprando
              </button>
              <button
                className="btn-hero-primary"
                onClick={() => navigate("/mis-pedidos")}
              >
                Ver mis pedidos →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="carrito-page">
      <div className="carrito-wrapper">

        <h1 className="carrito-titulo">🛒 Mi Carrito</h1>
        <p className="carrito-subtitulo">
          {totalItems > 0 ? `${totalItems} productos seleccionados` : "Tu carrito está vacío"}
        </p>

        {items.length === 0 ? (
          <div className="carrito-vacio">
            <div style={{ fontSize: '3rem' }}>🛍️</div>
            <h3>Tu carrito está vacío</h3>
            <p>Explora nuestro catálogo y agrega productos que te gusten</p>
            <button className="btn-hero-primary" onClick={() => navigate("/productos")}>
              Explorar productos →
            </button>
          </div>
        ) : (
          <div className="carrito-layout">

            {/* Items */}
            <div className="carrito-items">
              {items.map(item => (
                <div key={item.id_producto} className="carrito-item-card">
                  {item.imagen
                    ? <img src={item.imagen} alt={item.nombre_producto} className="carrito-item-img" />
                    : <div className="carrito-item-placeholder">📦</div>
                  }
                  <div className="carrito-item-info">
                    <h3 className="carrito-item-nombre">{item.nombre_producto}</h3>
                    <div className="carrito-item-tienda">
                      {item.seccion?.emprendedora?.usuario?.nombre || "EVA"}
                    </div>
                    <div className="carrito-item-acciones">
                      <div className="carrito-cantidad">
                        <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}>−</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}>+</button>
                      </div>
                      <span className="carrito-item-precio">
                        {formatPrecio(Number(item.precio) * item.cantidad)}
                      </span>
                    </div>
                  </div>
                  <button className="btn-quitar-item" onClick={() => quitar(item.id_producto)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="carrito-resumen">
              <h3 className="resumen-titulo">Resumen del pedido</h3>

              {/* Líneas */}
              {items.map(item => (
                <div key={item.id_producto} className="resumen-linea">
                  <span>{item.nombre_producto} x{item.cantidad}</span>
                  <span>{formatPrecio(Number(item.precio) * item.cantidad)}</span>
                </div>
              ))}

              {/* Cupón */}
              <div className="resumen-cupon">
                <input
                  type="text"
                  placeholder="Código de cupón"
                  value={codigoCupon}
                  onChange={e => setCodigoCupon(e.target.value.toUpperCase())}
                />
                <button className="btn-aplicar-cupon" onClick={handleAplicarCupon}>
                  Aplicar
                </button>
              </div>
              {cupon && (
                <div className="cupon-ok">
                  ✓ Cupón aplicado: -{cupon.tipo === "porcentaje" ? `${cupon.valor}%` : formatPrecio(cupon.valor)}
                </div>
              )}
              {cuponError && <div className="cupon-error">⚠️ {cuponError}</div>}

              {/* Total */}
              {cupon && (
                <div className="resumen-linea">
                  <span>Subtotal</span>
                  <span>{formatPrecio(total)}</span>
                </div>
              )}
              {cupon && (
                <div className="resumen-linea" style={{ color: '#16a34a' }}>
                  <span>Descuento</span>
                  <span>-{formatPrecio(total - totalConDescuento())}</span>
                </div>
              )}
              <div className="resumen-linea total">
                <span>Total</span>
                <span>{formatPrecio(totalConDescuento())}</span>
              </div>

              {/* Método de pago */}
              <div className="resumen-metodo-titulo">Método de pago</div>
              <div className="metodos-pago">
                {METODOS_PAGO.map(m => (
                  <label
                    key={m.value}
                    className={`metodo-option ${metodoPago === m.value ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="metodo"
                      value={m.value}
                      checked={metodoPago === m.value}
                      onChange={() => setMetodoPago(m.value)}
                    />
                    <span className="metodo-icono">{m.icono}</span>
                    {m.label}
                  </label>
                ))}
              </div>

              {/* Nota */}
              <div className="resumen-nota">
                <label>Nota para la emprendedora (opcional)</label>
                <textarea
                  placeholder="Ej: Necesito entrega urgente..."
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                />
              </div>

              <button
                className="btn-confirmar-pedido"
                onClick={handleConfirmar}
                disabled={confirmando || !metodoPago}
              >
                {!token
                  ? "Inicia sesión para comprar"
                  : confirmando
                  ? "Confirmando..."
                  : `Confirmar pedido — ${formatPrecio(totalConDescuento())}`
                }
              </button>
            </div>

          </div>
        )}
      </div>

      {toast && <div className="carrito-toast">{toast}</div>}
    </div>
  )
}