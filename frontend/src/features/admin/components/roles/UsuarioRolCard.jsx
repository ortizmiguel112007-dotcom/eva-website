import "@/infrastructure/css/admin/roles/UsuarioRolCard.css"

const ROL_COLOR = {
  usuario:       { bg: "#eff6ff", color: "#2563eb" },
  emprendedora:  { bg: "#fff7ed", color: "#ab0cea" },
  administrador: { bg: "#f0fdf4", color: "#ff0000" },
}

export function UsuarioRolCard({ usuario: u, rolTemporal, onChange, onGuardar }) {
  const rolActual = rolTemporal || u.rol
  const estilo    = ROL_COLOR[rolActual] || ROL_COLOR.usuario
  const hayCambio = rolTemporal && rolTemporal !== u.rol

  return (
    <div className="usuario-card">
      <div className="usuario-info">
        <div className="usuario-avatar">
          {u.nombre?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <h4>{u.nombre}</h4>
          <span>{u.email}</span>
          <span className="usuario-rol-badge" style={{
            background: ROL_COLOR[u.rol]?.bg || "#f1f5f9",
            color:      ROL_COLOR[u.rol]?.color || "#374151",
          }}>
            {u.rol}
          </span>
        </div>
      </div>

      <div className="rol-actions">
        <select
          value={rolActual}
          onChange={e => onChange(u.id, e.target.value)}
          className="select-rol"
          style={{ background: estilo.bg, color: estilo.color, borderColor: estilo.color, fontWeight: 600 }}
        >
          <option value="administrador">Administrador</option>
          <option value="emprendedora">Emprendedora</option>
          <option value="usuario">Usuario</option>
        </select>

        <button
          className={`btn-guardar ${hayCambio ? "btn-guardar-activo" : ""}`}
          onClick={() => onGuardar(u.id)}
          disabled={!hayCambio}
          title={hayCambio ? "Guardar cambio de rol" : "Sin cambios"}
        >
          {hayCambio ? "Guardar" : "Sin cambios"}
        </button>
      </div>
    </div>
  )
}