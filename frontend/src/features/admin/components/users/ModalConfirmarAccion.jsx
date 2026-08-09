import "@/infrastructure/css/auth/users/ModalConfirmarAccion.css"

export function ModalConfirmarAccion({ modalData, onConfirmar, onCerrar }) {
  if (!modalData) return null
  const { usuario, tipo } = modalData

  const label = tipo === "aprobar"  ? "aprobar"
    : tipo === "rechazar" ? "rechazar"
    : usuario.activo      ? "desactivar"
    :                       "activar"

  const btnLabel = tipo === "aprobar"  ? "Sí, aprobar"
    : tipo === "rechazar" ? "Sí, rechazar"
    : usuario.activo      ? "Sí, desactivar"
    :                       "Sí, activar"

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-confirm">
        <h2>Confirmar acción</h2>
        <p>
          ¿Seguro que deseas <strong>{label}</strong> la cuenta de <strong>{usuario.nombre}</strong>?
        </p>
        {(tipo === "aprobar" || tipo === "rechazar") && usuario.foto_documento && (
          <div style={{ marginTop: "0.75rem" }}>
            <p style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              Documento de identidad:
            </p>
            <img src={usuario.foto_documento} alt="Documento"
              style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}
            />
          </div>
        )}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className={tipo === "rechazar" ? "btn-danger" : "btn-success"} onClick={onConfirmar}>
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}