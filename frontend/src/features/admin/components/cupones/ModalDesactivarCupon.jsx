import { useState } from "react"
import { FiAlertTriangle } from "react-icons/fi"

import "@/infrastructure/css/admin/cupones/ModalDesactivarCupon.css"

// RN-089: el admin desactiva por uso indebido y el motivo se notifica
// a la emprendedora dueña del cupón (crearNotificacion en el backend)
export function ModalDesactivarCupon({ cupon, onConfirmar, onCerrar }) {
  const [motivo, setMotivo]     = useState("")
  const [enviando, setEnviando] = useState(false)

  const handleConfirmar = async () => {
    setEnviando(true)
    await onConfirmar(motivo.trim() || null)
    setEnviando(false)
  }

  return (
    <div className="acd-overlay" onClick={onCerrar}>
      <div className="acd-modal" onClick={e => e.stopPropagation()}>
        <div className="acd-icon"><FiAlertTriangle size={20} /></div>
        <h3>Desactivar cupón</h3>
        <p>
          Vas a desactivar <strong>{cupon.codigo}</strong> de{" "}
          <strong>{cupon.usuario?.nombre || "esta emprendedora"}</strong>.
          Se le va a notificar automáticamente.
        </p>

        <div className="acd-field">
          <label>Motivo <span className="acd-hint">(opcional, se incluye en la notificación)</span></label>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ej: código compartido públicamente fuera de los términos permitidos"
            rows={3}
          />
        </div>

        <div className="acd-buttons">
          <button className="acd-btn-cancelar" onClick={onCerrar} disabled={enviando}>Cancelar</button>
          <button className="acd-btn-confirmar" onClick={handleConfirmar} disabled={enviando}>
            {enviando ? "Desactivando..." : "Desactivar cupón"}
          </button>
        </div>
      </div>
    </div>
  )
}