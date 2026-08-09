import { FiX, FiDownload } from "react-icons/fi"
import "@/infrastructure/css/usuario/facturas/FacturaModal.css"

export function FacturaModal({ factura, onCerrar, onDescargar }) {
  if (!factura) return null

  return (
    <div className="mf-modal-overlay" onClick={onCerrar}>
      <div className="mf-modal" onClick={e => e.stopPropagation()}>
        <div className="mf-modal-header">
          <h3>Vista previa — Factura {factura.numero}</h3>
          <button onClick={onCerrar}><FiX size={16} /></button>
        </div>
        <iframe
          src={factura.url_pdf}
          title={`Factura ${factura.numero}`}
          className="mf-preview-pdf"
        />
        <div className="mf-modal-footer">
          <button className="mf-btn-cancelar" onClick={onCerrar}>Cerrar</button>
          <button className="mf-btn-descargar-modal"
            onClick={() => { onDescargar(factura); onCerrar() }}>
            <FiDownload size={14} /> Descargar factura
          </button>
        </div>
      </div>
    </div>
  )
}