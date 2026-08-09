import { FiFileText, FiDownload, FiUser, FiRefreshCw } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/products-emprend/facturas/FacturaCard.css"

export function FacturaCard({ factura, mostrarCliente = false, mostrarTienda = false, onRegenerar }) {
  const { numero, url_pdf, fecha_emision, pedido } = factura

  const formatFecha = (f) =>
    new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })

  return (
    <div className="factura-card">
      <div className="factura-card-icono">
        <FiFileText size={20} color="#2563eb" />
      </div>

      <div className="factura-card-info">
        <div className="factura-card-numero">{numero}</div>
        <div className="factura-card-meta">
          Pedido #{pedido?.id_pedido} · Emitida el {formatFecha(fecha_emision)}
        </div>
        {mostrarCliente && pedido?.cliente?.nombre && (
          <div className="factura-card-cliente">
            <FiUser size={11} /> {pedido.cliente.nombre}
          </div>
        )}
        {mostrarTienda && pedido?.seccion?.emprendedora?.usuario?.nombre && (
          <div className="factura-card-cliente">
            Tienda: {pedido.seccion.emprendedora.usuario.nombre}
          </div>
        )}
      </div>

      <div className="factura-card-monto">
        <strong>{formatPrecio(pedido?.total)}</strong>
        <div className="factura-card-acciones">
          <a href={url_pdf} target="_blank" rel="noopener noreferrer" className="factura-btn-descargar">
            <FiDownload size={13} /> Descargar
          </a>
          {onRegenerar && (
            <button className="factura-btn-regenerar" onClick={() => onRegenerar(factura)}>
              <FiRefreshCw size={13} /> Regenerar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}