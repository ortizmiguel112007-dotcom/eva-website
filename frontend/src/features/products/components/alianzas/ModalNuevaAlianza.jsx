import "@/infrastructure/css/products-emprend/alianzas/ModalNuevaAlianza.css"

export function ModalNuevaAlianza({ form, setForm, formErrors, emprendedoras, guardando, onCrear, onCerrar }) {
  return (
    <div className="alianza-modal-overlay" onClick={onCerrar}>
      <div className="alianza-modal" onClick={e => e.stopPropagation()}>
        <h3>Nueva Alianza</h3>

        <div className="alianza-modal-field">
          <label>Nombre de la alianza</label>
          <input type="text" value={form.nombre}
            onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
            placeholder="Ej: Campaña verano 2026"
          />
          {formErrors.nombre && <span className="alianza-modal-error">{formErrors.nombre}</span>}
        </div>

        <div className="alianza-modal-field">
          <label>Descripción (opcional)</label>
          <textarea value={form.descripcion}
            onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Describe el objetivo de la alianza..."
          />
        </div>

        <div className="alianza-modal-field">
          <label>Invitar emprendedora</label>
          <select value={form.id_invitada}
            onChange={e => setForm(prev => ({ ...prev, id_invitada: e.target.value }))}>
            <option value="">Seleccionar emprendedora</option>
            {emprendedoras.map(e => (
              <option key={e.id} value={e.id}>{e.nombre} — {e.email}</option>
            ))}
          </select>
          {formErrors.id_invitada && <span className="alianza-modal-error">{formErrors.id_invitada}</span>}
        </div>

        <div className="alianza-modal-field">
          <label>Fecha de fin (opcional)</label>
          <input type="date" value={form.fecha_fin}
            onChange={e => setForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
          />
        </div>

        <div className="alianza-modal-buttons">
          <button className="btn-cancelar-alianza" onClick={onCerrar}>Cancelar</button>
          <button className="btn-crear-alianza" onClick={onCrear} disabled={guardando}>
            {guardando ? "Creando..." : "Crear alianza"}
          </button>
        </div>
      </div>
    </div>
  )
}