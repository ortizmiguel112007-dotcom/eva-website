import { useState } from "react"
import { FiX, FiRefreshCw } from "react-icons/fi"

export function ModalMotivoRegeneracion({ factura, onConfirmar, onCerrar, procesando }) {
  const [motivo, setMotivo] = useState("")

  if (!factura) return null

  const handleConfirmar = () => {
    if (!motivo.trim()) return
    onConfirmar(factura.id_factura, motivo.trim())
  }

  return (
    <div className="pagos-modal-overlay" onClick={onCerrar}>
      <div className="pagos-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="pagos-modal-header">
          <h3>Regenerar factura {factura.numero}</h3>
          <button className="pagos-modal-cerrar" onClick={onCerrar}>
            <FiX size={18} />
          </button>
        </div>

        <div className="pagos-modal-body">
          <div className="pagos-modal-rechazo">
            <label>Motivo de la regeneración (obligatorio)</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Corrección del nombre del producto en el comprobante..."
              autoFocus
            />
          </div>

          <div className="pagos-modal-btns">
            <button className="pago-btn-rechazar-modal" onClick={onCerrar} disabled={procesando}>
              Cancelar
            </button>
            <button
              className="pago-btn-verificar-modal"
              onClick={handleConfirmar}
              disabled={procesando || !motivo.trim()}
            >
              <FiRefreshCw size={14} /> {procesando ? "Regenerando..." : "Confirmar regeneración"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}