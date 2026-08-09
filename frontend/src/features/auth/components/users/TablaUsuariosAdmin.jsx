import { FaEdit } from "@/infrastructure/icons/index.js"

const PAGE_SIZE = 10

export function TablaUsuariosAdmin({ usuarios, paginaActual, busqueda, onEditar, onToggle }) {
  return (
    <div className="crud-table-wrapper">
      <table className="crud-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={6} className="td-empty">
                {busqueda ? "No se encontraron usuarios con ese criterio" : "No hay usuarios registrados"}
              </td>
            </tr>
          ) : usuarios.map((u, i) => (
            <tr key={u.id} className={!u.activo ? "row-inactivo" : ""}>
              <td>{(paginaActual - 1) * PAGE_SIZE + i + 1}</td>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.telefono || "—"}</td>
              <td>
                <span className={`badge-estado ${u.activo ? "badge-activo" : "badge-inactivo"}`}>
                  {u.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="td-actions">
                <button className="btn-icon btn-edit" title="Modificar usuario" onClick={() => onEditar(u)}>
                  <FaEdit />
                </button>
                <button
                  className={`btn-toggle ${u.activo ? "btn-inhabilitar" : "btn-habilitar"}`}
                  onClick={() => onToggle({ id: u.id, nombre: u.nombre, activo: u.activo })}
                >
                  {u.activo ? "Inhabilitar" : "Habilitar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}