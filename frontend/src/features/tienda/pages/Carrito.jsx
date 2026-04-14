import { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useCarrito } from "@/core/context/CarritoContext"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import {
  FiShoppingCart, FiMinus, FiPlus, FiTrash2,
  FiTag, FiCheck, FiPackage, FiUpload, FiImage
} from "react-icons/fi"
import { MdOutlineQrCode2 } from "react-icons/md"
import "@/infrastructure/css/carrito.css"
import "@/infrastructure/css/inicio.css"

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO")
}

function getQRUrl(texto) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(texto)}`
}

// ── Componente subir comprobante ──
function SubirComprobante({ pedido, token }) {
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState("")
  const [datosBancarios, setDatosBancarios] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const cargar = async () => {
      if (!pedido?.id_seccion) return
      try {
        const res = await axios.get(
          `http://localhost:3000/api/emprendedora/datos-bancarios/${pedido.id_seccion}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setDatosBancarios(res.data.datos_bancarios || null)
      } catch { setDatosBancarios(null) }
    }
    cargar()
  }, [pedido?.id_seccion, token])

  const handleArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setPreview(URL.createObjectURL(file))
    setError("")
  }

  const handleSubir = async () => {
    if (!archivo) { setError("Selecciona una imagen del comprobante"); return }
    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append("comprobante", archivo)
      await axios.post(
        `http://localhost:3000/api/pagos/${pedido.id_pedido}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      )
      setEnviado(true)
    } catch (err) {
      setError(err.response?.data?.error || "Error al subir comprobante")
    } finally { setSubiendo(false) }
  }

  if (enviado) {
    return (
      <div style={{ marginTop: "1rem", padding: "0.85rem", background: "#f0fdf4", borderRadius: "0.65rem", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#16a34a", fontWeight: 600 }}>
        <FiCheck size={16} /> Comprobante enviado — La emprendedora lo verificará pronto
      </div>
    )
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", margin: "0 0 0.5rem" }}>
        Sube tu comprobante de pago
      </p>

      {/* Datos bancarios */}
      {datosBancarios && (
        <div style={{ padding: "0.85rem 1rem", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "0.65rem", marginBottom: "0.75rem" }}>
          <p style={{ margin: "0 0 0.35rem", fontSize: "0.78rem", fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            🏦 Datos bancarios para transferencia
          </p>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b", whiteSpace: "pre-line" }}>
            {datosBancarios}
          </p>
        </div>
      )}

      {/* Área seleccionar imagen */}
      <div
        onClick={() => inputRef.current?.click()}
        style={{ border: "2px dashed", borderColor: preview ? "#3b82f6" : "#e5e7eb", borderRadius: "0.65rem", padding: "1.25rem", textAlign: "center", cursor: "pointer", background: "#fafafa", transition: "all 0.18s" }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "0.4rem", objectFit: "contain" }} />
        ) : (
          <>
            <FiImage size={28} color="#cbd5e1" style={{ marginBottom: "0.5rem" }} />
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>Toca para seleccionar imagen</p>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", color: "#cbd5e1" }}>PNG, JPG hasta 5MB</p>
          </>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleArchivo} style={{ display: "none" }} />

      {error && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0.4rem 0 0" }}>{error}</p>}

      <button
        onClick={handleSubir}
        disabled={subiendo || !archivo}
        style={{
          width: "100%", marginTop: "0.75rem", padding: "0.65rem", borderRadius: "0.55rem", border: "none",
          cursor: archivo && !subiendo ? "pointer" : "not-allowed",
          background: archivo && !subiendo ? "#1e293b" : "#e5e7eb",
          color: archivo && !subiendo ? "#fff" : "#9ca3af",
          fontSize: "0.85rem", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", transition: "all 0.2s"
        }}
      >
        <FiUpload size={14} />
        {subiendo ? "Subiendo..." : "Enviar comprobante"}
      </button>
    </div>
  )
}

export default function Carrito() {
  const navigate  = useNavigate()
  const { token } = useAuth()
  const { items, quitar, cambiarCantidad, vaciar, total, totalItems, cargarCarrito } = useCarrito()

  const [nota, setNota]                 = useState("")
  const [codigoCupon, setCodigoCupon]   = useState("")
  const [cupon, setCupon]               = useState(null)
  const [cuponError, setCuponError]     = useState("")
  const [confirmando, setConfirmando]   = useState(false)
  const [pedidosExito, setPedidosExito] = useState(null)
  const [toast, setToast]               = useState(null)

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const gruposEmprendedora = useMemo(() => {
    const grupos = {}
    items.forEach(item => {
      const key = item.emprendedora || "EVA"
      if (!grupos[key]) grupos[key] = { nombre: key, items: [], subtotal: 0 }
      grupos[key].items.push(item)
      grupos[key].subtotal += Number(item.precio) * item.cantidad
    })
    return Object.values(grupos)
  }, [items])

  const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) return
    setCuponError(""); setCupon(null)
    try {
      const res = await axios.post(
        "http://localhost:3000/api/cupones/validar",
        { codigo: codigoCupon },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCupon(res.data.cupon)
    } catch (err) { setCuponError(err.response?.data?.error || "Cupón inválido") }
  }

  const totalConDescuento = () => {
    if (!cupon) return total
    if (cupon.tipo === "porcentaje") return total * (1 - cupon.valor / 100)
    if (cupon.tipo === "valor_fijo") return Math.max(0, total - cupon.valor)
    return total
  }

  const handleConfirmar = async () => {
    if (!token) { navigate("/login"); return }
    if (items.length === 0) return
    setConfirmando(true)
    try {
      const res = await axios.post(
        "http://localhost:3000/api/cliente/pedidos",
        {
          items: items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
          metodo_pago: "qr", nota,
          id_cupon: cupon?.id_cupon || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await vaciar()
      await cargarCarrito()
      setPedidosExito(res.data.pedidos)
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al confirmar pedido")
    } finally { setConfirmando(false) }
  }

  // ── Pantalla de éxito ──
  if (pedidosExito) {
    return (
      <div className="carrito-page">
        <div className="carrito-wrapper">
          <div className="pedido-exito">
            <div className="pedido-exito-icono"></div>
            <h2>¡{pedidosExito.length > 1 ? `${pedidosExito.length} Pedidos confirmados` : "Pedido confirmado"}!</h2>
            <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "0.9rem" }}>
              {pedidosExito.length > 1
                ? "Escanea el QR de cada tienda y sube tu comprobante de pago."
                : "Escanea el QR y sube tu comprobante de pago."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", maxWidth: "540px" }}>
              {pedidosExito.map(pedido => {
                const emprendedora = pedido.seccion?.emprendedora?.usuario?.nombre || "EVA"
                const qrData = `EVA-PEDIDO-${pedido.id_pedido}-TOTAL-${pedido.total}-EMP-${emprendedora}`
                return (
                  <div key={pedido.id_pedido} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>Pedido #{pedido.id_pedido}</p>
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>
                          Tienda de <strong>{emprendedora}</strong>
                        </p>
                      </div>
                      <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.75rem" }}>
                        En proceso
                      </span>
                    </div>

                    {/* Productos */}
                    <div style={{ marginBottom: "0.75rem" }}>
                      {pedido.detalles?.map(d => (
                        <div key={d.id_detalle} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "0.3rem 0", borderBottom: "1px solid #f8fafc", color: "#374151" }}>
                          <span>{d.producto?.nombre_producto} x{d.cantidad}</span>
                          <span style={{ fontWeight: 700 }}>{formatPrecio(Number(d.precio_unit) * d.cantidad)}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.6rem", fontWeight: 800, fontSize: "0.95rem" }}>
                        <span>Total</span>
                        <span>{formatPrecio(pedido.total)}</span>
                      </div>
                    </div>

                    {/* QR */}
                    <div style={{ textAlign: "center", padding: "1.25rem", background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e5e7eb", marginBottom: "0.5rem" }}>
                      <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
                        <MdOutlineQrCode2 size={16} />
                        Escanea para pagar a {emprendedora}
                      </p>
                      <img src={getQRUrl(qrData)} alt="QR de pago"
                        style={{ width: "170px", height: "170px", borderRadius: "0.5rem", border: "4px solid #fff", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }} />
                      <p style={{ margin: "0.6rem 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
                        Referencia: EVA-{pedido.id_pedido}
                      </p>
                    </div>

                    {/* Subir comprobante — pasa id_seccion */}
                    <SubirComprobante pedido={{ ...pedido, id_seccion: pedido.id_seccion }} token={token} />
                  </div>
                )
              })}
            </div>

            <div className="pedido-exito-acciones" style={{ marginTop: "2rem" }}>
              <button className="btn-hero-secondary" style={{ color: "#1e293b", borderColor: "#e5e7eb" }} onClick={() => navigate("/productos")}>
                Seguir comprando
              </button>
              <button className="btn-hero-primary" onClick={() => navigate("/mis-pedidos")}>
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
        <h1 className="carrito-titulo">Mi Carrito</h1>
        <p className="carrito-subtitulo">
          {totalItems > 0
            ? `${totalItems} producto${totalItems !== 1 ? "s" : ""} seleccionado${totalItems !== 1 ? "s" : ""}`
            : "Tu carrito está vacío"}
        </p>

        {items.length === 0 ? (
          <div className="carrito-vacio">
            <FiShoppingCart size={48} color="#cbd5e1" />
            <h3>Tu carrito está vacío</h3>
            <p>Explora nuestro catálogo y agrega productos</p>
            <button className="btn-hero-primary" onClick={() => navigate("/productos")}>
              Explorar productos →
            </button>
          </div>
        ) : (
          <div className="carrito-layout">

            {/* Items agrupados */}
            <div className="carrito-items">
              {gruposEmprendedora.map(grupo => (
                <div key={grupo.nombre} className="carrito-grupo">
                  <div className="carrito-grupo-header">
                    <FiPackage size={13} />
                    <span>Tienda de <strong>{grupo.nombre}</strong></span>
                    <span className="carrito-grupo-subtotal">{formatPrecio(grupo.subtotal)}</span>
                  </div>
                  {grupo.items.map(item => (
                    <div key={item.id_producto} className="carrito-item-card">
                      {item.imagen
                        ? <img src={item.imagen} alt={item.nombre_producto} className="carrito-item-img" />
                        : <div className="carrito-item-placeholder"><FiPackage size={20} color="#94a3b8" /></div>
                      }
                      <div className="carrito-item-info">
                        <h3 className="carrito-item-nombre">{item.nombre_producto}</h3>
                        <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{item.categoria}</p>
                        <div className="carrito-item-acciones">
                          <div className="carrito-cantidad">
                            <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}><FiMinus size={12} /></button>
                            <span>{item.cantidad}</span>
                            <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}><FiPlus size={12} /></button>
                          </div>
                          <span className="carrito-item-precio">{formatPrecio(Number(item.precio) * item.cantidad)}</span>
                        </div>
                      </div>
                      <button className="btn-quitar-item" onClick={() => quitar(item.id_producto)}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}

              {gruposEmprendedora.length > 1 && (
                <div style={{ padding: "0.85rem 1rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.65rem", fontSize: "0.82rem", color: "#1d4ed8", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                  <FiPackage size={15} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                  <span>Tienes productos de <strong>{gruposEmprendedora.length} tiendas</strong>. Se crearán <strong>{gruposEmprendedora.length} pedidos</strong> con QR separados.</span>
                </div>
              )}
            </div>

            {/* Resumen lateral */}
            <div className="carrito-resumen">
              <h3 className="resumen-titulo">Resumen del pedido</h3>

              {gruposEmprendedora.map(grupo => (
                <div key={grupo.nombre} className="resumen-linea">
                  <span>{grupo.nombre} ({grupo.items.length} item{grupo.items.length !== 1 ? "s" : ""})</span>
                  <span>{formatPrecio(grupo.subtotal)}</span>
                </div>
              ))}

              <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0.5rem 0" }} />

              <div className="resumen-cupon">
                <input type="text" placeholder="Código de cupón"
                  value={codigoCupon}
                  onChange={e => setCodigoCupon(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleAplicarCupon()} />
                <button className="btn-aplicar-cupon" onClick={handleAplicarCupon}>
                  <FiTag size={12} /> Aplicar
                </button>
              </div>
              {cupon && <div className="cupon-ok"><FiCheck size={12} /> -{cupon.tipo === "porcentaje" ? `${cupon.valor}%` : formatPrecio(cupon.valor)}</div>}
              {cuponError && <div className="cupon-error">⚠️ {cuponError}</div>}

              {cupon && (
                <>
                  <div className="resumen-linea"><span>Subtotal</span><span>{formatPrecio(total)}</span></div>
                  <div className="resumen-linea" style={{ color: "#16a34a" }}><span>Descuento</span><span>-{formatPrecio(total - totalConDescuento())}</span></div>
                </>
              )}

              <div className="resumen-linea total">
                <span>Total</span>
                <span>{formatPrecio(totalConDescuento())}</span>
              </div>

              <div className="resumen-metodo-titulo">Método de pago</div>
              <div style={{ padding: "0.85rem 1rem", background: "#f8fafc", border: "1.5px solid #1e293b", borderRadius: "0.65rem", display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.88rem", fontWeight: 700, color: "#1e293b" }}>
                <MdOutlineQrCode2 size={18} /> Pago QR
                <FiCheck size={14} color="#16a34a" style={{ marginLeft: "auto" }} />
              </div>

              <div style={{ padding: "0.65rem 0.85rem", background: "#f0fdf4", borderRadius: "0.5rem", border: "1px solid #bbf7d0", fontSize: "0.78rem", color: "#166534" }}>
                <MdOutlineQrCode2 size={13} style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
                Se generará un QR por cada emprendedora. Deberás subir el comprobante.
              </div>

              <div className="resumen-nota">
                <label>Nota (opcional)</label>
                <textarea placeholder="Ej: Necesito entrega urgente..." value={nota} onChange={e => setNota(e.target.value)} />
              </div>

              <button className="btn-confirmar-pedido" onClick={handleConfirmar} disabled={confirmando}>
                <FiShoppingCart size={15} />
                {!token ? "Inicia sesión para comprar"
                  : confirmando ? "Confirmando..."
                  : `Confirmar ${gruposEmprendedora.length > 1 ? `${gruposEmprendedora.length} pedidos` : "pedido"} — ${formatPrecio(totalConDescuento())}`}
              </button>

              <button className="btn-vaciar-carrito" onClick={vaciar}>Vaciar carrito</button>
            </div>
          </div>
        )}
      </div>
      {toast && <div className="carrito-toast">{toast}</div>}
    </div>
  )
}
