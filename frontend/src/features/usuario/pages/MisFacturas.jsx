import { useState, useEffect } from "react"
import { useAuth } from "@/core/context/AuthConten"
import axios from "axios"
import {
  FiFileText, FiDownload, FiPackage,
  FiCalendar, FiDollarSign, FiEye, FiX
} from "react-icons/fi"
import { MdOutlineQrCode2 } from "react-icons/md"
import "@/infrastructure/css/MisFacturas.css"
import "@/infrastructure/css/CrudAdmin.css"

function formatPrecio(p) { return "$" + Number(p).toLocaleString("es-CO") }
function formatFecha(f) {
  return new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric"
  })
}

export default function MisFacturas() {
  const { token, user } = useAuth()
  const [pedidos, setPedidos]   = useState([])
  const [cargando, setCargando] = useState(true)
  const [preview, setPreview]   = useState(null)
  const [pagina, setPagina]     = useState(1)
  const POR_PAGINA = 6

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/cliente/pedidos", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPedidos(res.data.filter(p => p.estado === "entregado"))
      } catch { setPedidos([]) }
      finally { setCargando(false) }
    }
    cargar()
  }, [token])

  const totalGastado  = pedidos.reduce((acc, p) => acc + Number(p.total), 0)
  const totalPaginas  = Math.max(1, Math.ceil(pedidos.length / POR_PAGINA))
  const pedidosPagina = pedidos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const generarFactura = (pedido) => {
    const tienda = pedido.seccion?.emprendedora?.usuario?.nombre || "EVA"
    const num    = String(pedido.id_pedido).padStart(5, "0")
    const lineas = [
      "╔══════════════════════════════════════╗",
      "║          EVA MARKETPLACE             ║",
      "║       Factura Digital de Venta       ║",
      "╚══════════════════════════════════════╝",
      "",
      `  N° Factura  : EVA-${num}`,
      `  Fecha       : ${formatFecha(pedido.fecha)}`,
      `  Cliente     : ${user?.nombre || "Cliente"}`,
      `  Tienda      : ${tienda}`,
      `  Método pago : ${pedido.metodo_pago?.toUpperCase() || "QR"}`,
      "",
      "  ─────────────────────────────────────",
      "  PRODUCTOS:",
      ...pedido.detalles.map(d =>
        `  • ${d.producto?.nombre_producto}\n    ${d.cantidad} u × ${formatPrecio(d.precio_unit)} = ${formatPrecio(Number(d.precio_unit) * d.cantidad)}`
      ),
      "  ─────────────────────────────────────",
      `  TOTAL : ${formatPrecio(pedido.total)}`,
      "",
      "  Estado: ENTREGADO ✓",
      "",
      "══════════════════════════════════════",
      "  Gracias por comprar en EVA",
      "  marketplace de emprendedoras",
      "══════════════════════════════════════",
    ]
    return lineas.join("\n")
  }

  const handleDescargar = (pedido) => {
    const contenido = generarFactura(pedido)
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `factura-EVA-${String(pedido.id_pedido).padStart(5,"0")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (cargando) return (
    <div className="mf-loading">
      <div className="mf-spinner" />
      <p>Cargando facturas...</p>
    </div>
  )

  return (
    <div className="mf-page">

      {/* Header */}
      <div className="mf-header">
        <div className="mf-header-left">
          <div className="mf-header-icon">
            <FiFileText size={22} color="#fff" />
          </div>
          <div>
            <h1 className="mf-titulo">Mis Facturas</h1>
            <p className="mf-sub">Documentos de tus pedidos entregados</p>
          </div>
        </div>

        {pedidos.length > 0 && (
          <div className="mf-resumen">
            <div className="mf-resumen-item">
              <span>{pedidos.length}</span>
              <p>facturas</p>
            </div>
            <div className="mf-resumen-divider" />
            <div className="mf-resumen-item">
              <span>{formatPrecio(totalGastado)}</span>
              <p>total histórico</p>
            </div>
          </div>
        )}
      </div>

      {/* Lista */}
      {pedidos.length === 0 ? (
        <div className="mf-empty">
          <div className="mf-empty-ilustracion">
            <div className="mf-empty-papel">
              <FiFileText size={40} color="#c7d2fe" />
            </div>
            <div className="mf-empty-sombra" />
          </div>
          <h3>Sin facturas todavía</h3>
          <p>Las facturas se generan cuando tu pedido es marcado como <strong>entregado</strong></p>
        </div>
      ) : (
        <>
          <div className="mf-lista">
            {pedidosPagina.map((pedido, idx) => {
              const tienda = pedido.seccion?.emprendedora?.usuario?.nombre || "EVA"
              const num    = String(pedido.id_pedido).padStart(5, "0")
              return (
                <div key={pedido.id_pedido} className="mf-card"
                  style={{ animationDelay: `${idx * 0.06}s` }}>

                  <div className="mf-card-stripe" />

                  <div className="mf-card-icon">
                    <FiFileText size={20} color="#6366f1" />
                    <span className="mf-card-icon-num">#{num}</span>
                  </div>

                  <div className="mf-card-info">
                    <div className="mf-card-titulo-row">
                      <h3 className="mf-card-titulo">Factura EVA-{num}</h3>
                      <span className="mf-card-estado">✓ Entregado</span>
                    </div>
                    <div className="mf-card-meta">
                      <span><FiPackage size={11} /> {tienda}</span>
                      <span><FiCalendar size={11} /> {formatFecha(pedido.fecha)}</span>
                      <span><MdOutlineQrCode2 size={11} /> {pedido.metodo_pago?.toUpperCase() || "QR"}</span>
                      <span className="mf-card-items">
                        {pedido.detalles?.length} producto{pedido.detalles?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="mf-card-total">
                    <span className="mf-card-total-label">Total</span>
                    <strong className="mf-card-total-valor">{formatPrecio(pedido.total)}</strong>
                  </div>

                  <div className="mf-card-acciones">
                    <button className="mf-btn-ver" onClick={() => setPreview(pedido)}>
                      <FiEye size={13} /> Vista previa
                    </button>
                    <button className="mf-btn-descargar" onClick={() => handleDescargar(pedido)}>
                      <FiDownload size={13} /> Descargar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="crud-pagination">
              <span className="pagination-info">
                {pedidos.length} factura{pedidos.length !== 1 ? "s" : ""} · Página {pagina} de {totalPaginas}
              </span>
              <div className="pagination-controls">
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(1)} disabled={pagina === 1}>«</button>
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>‹</button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`page-btn ${n === pagina ? "page-btn-active" : ""}`} onClick={() => setPagina(n)}>{n}</button>
                ))}
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>›</button>
                <button className="page-btn page-btn-arrow" onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>»</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal preview */}
      {preview && (
        <div className="mf-modal-overlay" onClick={() => setPreview(null)}>
          <div className="mf-modal" onClick={e => e.stopPropagation()}>
            <div className="mf-modal-header">
              <h3>Vista previa — Factura EVA-{String(preview.id_pedido).padStart(5,"0")}</h3>
              <button onClick={() => setPreview(null)}>
                <FiX size={16} />
              </button>
            </div>
            <pre className="mf-preview-txt">{generarFactura(preview)}</pre>
            <div className="mf-modal-footer">
              <button className="mf-btn-cancelar" onClick={() => setPreview(null)}>Cerrar</button>
              <button className="mf-btn-descargar-modal" onClick={() => { handleDescargar(preview); setPreview(null) }}>
                <FiDownload size={14} /> Descargar factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}