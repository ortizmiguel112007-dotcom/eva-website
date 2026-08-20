import { FiTag, FiCheck, FiShoppingCart, FiTruck } from "react-icons/fi"
import { MdOutlineQrCode2 } from "react-icons/md"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/tienda/carrito/ResumenPedido.css"

const METODOS = [
  {
    id:    "nequi",
    label: "Nequi",
    icon:  <MdOutlineQrCode2 size={18} />,
    desc:  "Transfiere por Nequi y sube el comprobante",
  },
  {
    id:    "bancolombia",
    label: "Bancolombia",
    icon:  <MdOutlineQrCode2 size={18} />,
    desc:  "Transfiere por Bancolombia y sube el comprobante",
  },
  {
    id:    "contraentrega",
    label: "Contra entrega",
    icon:  <FiTruck size={18} />,
    desc:  "Pagas al recibir tu pedido",
  },
]

export function ResumenPedido({
  gruposEmprendedora, total, cupon, cuponError,
  codigoCupon, setCodigoCupon, onAplicarCupon,
  nota, setNota, confirmando, token,
  onConfirmar, onVaciar,
  metodoPago, setMetodoPago,
  metodosDisponibles, cargandoMetodos,
}) {
  // 🆕 descuento calculado por grupo (id_seccion), no sobre el total global
  const idsSeccionCupon = cupon?.secciones_aplicables || []

  const calcularTotales = () => {
    let totalFinal = 0
    let descuentoTotal = 0

    gruposEmprendedora.forEach((grupo) => {
      let sub = grupo.subtotal
      if (cupon && idsSeccionCupon.includes(grupo.id_seccion)) {
        const desc = cupon.tipo === "porcentaje"
          ? sub * (Number(cupon.valor) / 100)
          : Math.min(Number(cupon.valor), sub) // no puede descontar más que el subtotal de esa tienda
        descuentoTotal += desc
        sub -= desc
      }
      totalFinal += sub
    })

    return { totalFinal, descuentoTotal }
  }

  const { totalFinal, descuentoTotal } = calcularTotales()
  const cuponAplica = descuentoTotal > 0

  const metodosFiltrados = metodosDisponibles
    ? METODOS.filter(m => metodosDisponibles[m.id])
    : METODOS

  return (
    <div className="carrito-resumen">
      <h3 className="resumen-titulo">Resumen del pedido</h3>

      {gruposEmprendedora.map(grupo => (
        <div key={grupo.id_seccion ?? grupo.nombre} className="resumen-linea">
          <span>{grupo.nombre} ({grupo.items.length} item{grupo.items.length !== 1 ? "s" : ""})</span>
          <span>{formatPrecio(grupo.subtotal)}</span>
        </div>
      ))}

      <hr className="resumen-divider" />

      {/* Cupón */}
      <div className="resumen-cupon">
        <input type="text" placeholder="Código de cupón"
          value={codigoCupon}
          onChange={e => setCodigoCupon(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && onAplicarCupon()} />
        <button className="btn-aplicar-cupon" onClick={onAplicarCupon}>
          <FiTag size={12} /> Aplicar
        </button>
      </div>

      {cupon && (
        <div className="cupon-ok">
          <FiCheck size={12} /> Cupón {cupon.codigo} —{" "}
          {cupon.tipo === "porcentaje" ? `${cupon.valor}%` : formatPrecio(cupon.valor)}
        </div>
      )}
      {cuponError && <div className="cupon-error">{cuponError}</div>}

      {cuponAplica && (
        <>
          <div className="resumen-linea"><span>Subtotal</span><span>{formatPrecio(total)}</span></div>
          <div className="resumen-linea descuento">
            <span>Descuento</span>
            <span>-{formatPrecio(descuentoTotal)}</span>
          </div>
        </>
      )}

      <div className="resumen-linea total">
        <span>Total</span>
        <span>{formatPrecio(totalFinal)}</span>
      </div>

      {/* ── Método de pago ── */}
      <div className="resumen-metodo-titulo">Método de pago</div>

      {cargandoMetodos ? (
        <div className="resumen-metodos-loading">Cargando métodos de pago...</div>
      ) : metodosFiltrados.length === 0 ? (
        <div className="resumen-metodos-vacio">
          <p>Las emprendedoras no tienen métodos de pago configurados aún.</p>
          <p>Contáctalas directamente para coordinar el pago.</p>
        </div>
      ) : (
        <div className="resumen-metodos">
          {metodosFiltrados.map(m => (
            <button
              key={m.id}
              className={`resumen-metodo-btn ${metodoPago === m.id ? "activo" : ""}`}
              onClick={() => setMetodoPago(m.id)}
              type="button"
            >
              <div className="resumen-metodo-icono">{m.icon}</div>
              <div className="resumen-metodo-info">
                <span className="resumen-metodo-label">{m.label}</span>
                <span className="resumen-metodo-desc">{m.desc}</span>
              </div>
              {metodoPago === m.id && <FiCheck size={14} color="#16a34a" className="resumen-metodo-check" />}
            </button>
          ))}
        </div>
      )}

      {!metodoPago && !cargandoMetodos && metodosFiltrados.length > 0 && (
        <p className="resumen-metodo-error">Selecciona un método de pago</p>
      )}

      {/* Nota */}
      <div className="resumen-nota">
        <label>Nota (opcional)</label>
        <textarea placeholder="Ej: Necesito entrega urgente..."
          value={nota} onChange={e => setNota(e.target.value)} />
      </div>

      <button className="btn-confirmar-pedido" onClick={onConfirmar}
        disabled={confirmando || !metodoPago || cargandoMetodos}>
        <FiShoppingCart size={15} />
        {!token ? "Inicia sesión para comprar"
          : cargandoMetodos ? "Cargando..."
          : confirmando ? "Confirmando..."
          : !metodoPago ? "Selecciona un método de pago"
          : `Confirmar ${gruposEmprendedora.length > 1 ? `${gruposEmprendedora.length} pedidos` : "pedido"} — ${formatPrecio(totalFinal)}`}
      </button>

      <button className="btn-vaciar-carrito" onClick={onVaciar}>Vaciar carrito</button>
    </div>
  )
}
