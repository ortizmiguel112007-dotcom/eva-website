export function ModalConfirmarToggle({ usuario, cargando, onConfirmar, onCerrar }) {
  if (!usuario) return null
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card modal-confirm" onClick={e => e.stopPropagation()}>
        <h2>{usuario.activo ? "Inhabilitar usuario" : "Habilitar usuario"}</h2>
        <p>
          {usuario.activo ? (
            <><strong>{usuario.nombre}</strong> será inhabilitado. Su información se conservará.</>
          ) : (
            <>¿Deseas habilitar nuevamente a <strong>{usuario.nombre}</strong>?</>
          )}
        </p>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button
            className={usuario.activo ? "btn-danger" : "btn-success"}
            disabled={cargando}
            onClick={onConfirmar}
          >
            {cargando
              ? "Procesando..."
              : usuario.activo ? "Sí, inhabilitar" : "Sí, habilitar"}
          </button>
        </div>
      </div>
    </div>
  )
}