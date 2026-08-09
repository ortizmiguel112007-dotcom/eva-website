import "@/infrastructure/css/auth/users/ModalFotoDocumento.css"

export function ModalFotoDocumento({ usuario, esPendiente, onCerrar, onAccion }) {
  if (!usuario) return null

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h2>Documento de {usuario.nombre}</h2>
        </div>
        <img src={usuario.foto_documento} alt="Documento"
          style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #e5e7eb", margin: "1rem 0" }}
        />
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCerrar}>Cerrar</button>
          {esPendiente(usuario) && (
            <>
              <button className="btn-danger"   onClick={() => onAccion(usuario, "rechazar")}>Rechazar</button>
              <button className="btn-primary"  onClick={() => onAccion(usuario, "aprobar")}>Aprobar</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}