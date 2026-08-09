import { PaginacionSimple } from "@/features/usuario/components/historial/PaginacionSimple"

import "@/infrastructure/css/auth/users/TablaEmprendedoras.css"

const PAGE_SIZE = 10

export function TablaEmprendedoras({ usuarios, pagina, setPagina, onAccion, onVerDocumento }) {
  const totalPaginas   = Math.max(1, Math.ceil(usuarios.length / PAGE_SIZE))
  const usuariosPagina = usuarios.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  const esPendiente = u => u.rol === "emprendedora" && !u.activo
  const esAprobado  = u => u.rol === "emprendedora" && u.activo

  return (
    <>
      <div className="crud-table-wrapper">
        <table className="crud-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Documento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPagina.length === 0 ? (
              <tr><td colSpan={6} className="td-empty">No hay emprendedoras con este filtro</td></tr>
            ) : usuariosPagina.map((u, i) => {
              const pendiente = esPendiente(u)
              const aprobado  = esAprobado(u)
              return (
                <tr key={u.id}>
                  <td>{(pagina - 1) * PAGE_SIZE + i + 1}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge-estado ${pendiente ? "badge-pendiente" : aprobado ? "badge-activo" : "badge-inactivo"}`}>
                      {pendiente ? "Pendiente" : aprobado ? "Aprobado" : "Desactivado"}
                    </span>
                  </td>
                  <td>
                    {u.foto_documento
                      ? <button className="btn-toggle btn-habilitar" onClick={() => onVerDocumento(u)}>Ver documento</button>
                      : <span style={{ color: "#9ca3af", fontSize: "0.78rem" }}>—</span>
                    }
                  </td>
                  <td className="td-actions">
                    {pendiente && (
                      <>
                        <button className="btn-toggle btn-habilitar" onClick={() => onAccion(u, "aprobar")}>Aprobar</button>
                        <button className="btn-toggle btn-inhabilitar" onClick={() => onAccion(u, "rechazar")}>Rechazar</button>
                      </>
                    )}
                    {aprobado && (
                      <button className="btn-toggle btn-inhabilitar" onClick={() => onAccion(u, "toggle")}>Desactivar</button>
                    )}
                    {!pendiente && !aprobado && (
                      <button className="btn-toggle btn-habilitar" onClick={() => onAccion(u, "toggle")}>Activar</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <PaginacionSimple
        pagina={pagina}
        totalPaginas={totalPaginas}
        setPagina={setPagina}
        total={usuarios.length}
        labelSingular="emprendedora"
        labelPlural="emprendedoras"
      />
    </>
  )
}