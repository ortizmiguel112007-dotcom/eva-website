import { useState } from "react"
import { FiX, FiStar } from "react-icons/fi"

export function ModalSolicitarDestacado({ producto, onConfirmar, onCerrar, procesando }) {
  const [categoria, setCategoria] = useState("")

  if (!producto) return null

  return (
    <div className="pagos-modal-overlay" onClick={onCerrar}>
      <div className="pagos-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="pagos-modal-header">
          <h3>Solicitar destacado — {producto.nombre_producto}</h3>
          <button className="pagos-modal-cerrar" onClick={onCerrar}><FiX size={18} /></button>
        </div>

        <div className="pagos-modal-body">
          <div className="pagos-modal-rechazo">
            <label>Categoría (opcional)</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1.5px solid #e5e7eb" }}
            >
              <option value="">Sin categoría específica</option>
              <option value="nuevos">Nuevo</option>
              <option value="en_oferta">En oferta</option>
            </select>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.4rem" }}>
              "Más vendido" se asigna automáticamente por el sistema, no se puede seleccionar aquí.
            </p>
          </div>

          <div className="pagos-modal-btns">
            <button className="pago-btn-rechazar-modal" onClick={onCerrar} disabled={procesando}>Cancelar</button>
            <button
              className="pago-btn-verificar-modal"
              onClick={() => onConfirmar(producto.id_producto, categoria)}
              disabled={procesando}
            >
              <FiStar size={14} /> {procesando ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}