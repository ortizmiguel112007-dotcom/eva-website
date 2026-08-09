import { FaUser, FaTimes } from "@/infrastructure/icons/index.js"
import { MdEmail, IoMdLock, FaPhone } from "@/infrastructure/icons/index.js"

export function ModalUsuarioAdmin({ form, editandoId, cargando, onChange, onSubmit, onCerrar }) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editandoId ? "Modificar usuario" : "Nuevo usuario"}</h2>
          <button className="btn-icon-close" onClick={onCerrar}><FaTimes /></button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          <div className="modal-inputs">
            <div className="modal-input-row">
              <FaUser />
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" placeholder="Ej: Juan Pérez"
                value={form.nombre} onChange={onChange} required />
            </div>
            <div className="modal-input-row">
              <MdEmail />
              <label htmlFor="email">Correo</label>
              <input id="email" name="email" type="email" placeholder="Ej: juan@gmail.com"
                value={form.email} onChange={onChange} required />
            </div>
            <div className="modal-input-row">
              <FaPhone />
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" name="telefono" type="tel" placeholder="Ej: 1030318920"
                value={form.telefono} onChange={onChange} />
            </div>
            <div className="modal-input-row">
              <IoMdLock />
              <label htmlFor="password">
                {editandoId ? "Nueva contraseña" : "Contraseña"}
              </label>
              <input id="password" name="password" type="password"
                placeholder={editandoId ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"}
                value={form.password} onChange={onChange} required={!editandoId} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando
                ? editandoId ? "Guardando..." : "Creando..."
                : editandoId ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}