import { useState, useEffect } from "react";
import { useAuth } from "@/core/context/AuthConten";
import { adminService } from "@/features/admin/services/admin.service";
import "@/infrastructure/css/AdminDashboard.css";
import "@/infrastructure/css/CrudAdmin.css";

const PAGE_SIZE = 10;

function UserManagement() {
  const { user } = useAuth();

  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [busqueda, setBusqueda]           = useState("");
  const [filtro, setFiltro]               = useState("Todos");
  const [toast, setToast]                 = useState(null);
  const [modalData, setModalData]         = useState(null);
  const [fotoModal, setFotoModal]         = useState(null);
  const [pagina, setPagina]               = useState(1);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await adminService.listarUsuarios();
        setListaUsuarios(data);
      } catch (err) {
        mostrarToast("Error al cargar usuarios");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Resetear página al cambiar filtros
  useEffect(() => { setPagina(1) }, [busqueda, filtro]);

  const mostrarToast = (mensaje, tipo = "ok") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Helpers ──────────────────────────────────────────────
  const esPendiente = (u) => u.rol === "emprendedora" && !u.activo;
  const esAprobado  = (u) => u.rol === "emprendedora" && u.activo;

  // ── Acciones ─────────────────────────────────────────────
  const aprobar = async (id) => {
    try {
      await adminService.aprobarEmprendedora(id);
      setListaUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: true } : u));
      mostrarToast("Emprendedora aprobada correctamente");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al aprobar", "error");
    }
    setModalData(null);
  };

  const rechazar = async (id) => {
    try {
      await adminService.rechazarEmprendedora(id);
      setListaUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol: "usuario", activo: false } : u));
      mostrarToast("Solicitud rechazada");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al rechazar", "error");
    }
    setModalData(null);
  };

  const toggleActivo = async (id) => {
    try {
      const res = await adminService.toggleEstado(id);
      setListaUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: res.usuario.activo } : u));
      mostrarToast(res.message);
    } catch {
      mostrarToast("Error al cambiar estado", "error");
    }
    setModalData(null);
  };

  const ejecutarAccion = async () => {
    if (!modalData) return;
    const { usuario, tipo } = modalData;
    if (tipo === "aprobar")  await aprobar(usuario.id);
    if (tipo === "rechazar") await rechazar(usuario.id);
    if (tipo === "toggle")   await toggleActivo(usuario.id);
  };

  // ── Filtrado ──────────────────────────────────────────────
  const usuariosFiltrados = listaUsuarios.filter(u => {
    if (u.rol !== "emprendedora") return false;

    const coincideBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());

    const coincideFiltro =
      filtro === "Todos"       ? true
      : filtro === "Pendiente" ? esPendiente(u)
      : filtro === "Aprobado"  ? esAprobado(u)
      : filtro === "Desactivado" ? (!u.activo && !esPendiente(u))
      : true;

    return coincideBusqueda && coincideFiltro;
  });

  // ── Paginación ────────────────────────────────────────────
  const totalPaginas  = Math.max(1, Math.ceil(usuariosFiltrados.length / PAGE_SIZE));
  const usuariosPagina = usuariosFiltrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  if (user?.rol !== "admin") return <h2>No autorizado</h2>;
  if (cargando) return <p>Cargando usuarios...</p>;

  return (
    <div className="crud-admin">

      {toast && (
        <div className={`crud-toast ${toast.tipo === "error" ? "toast-error" : "toast-ok"}`}>
          {toast.mensaje}
        </div>
      )}

      <div className="crud-header">
        <h1>Solicitudes de Emprendedoras</h1>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className="crud-search-bar" style={{ flex: 1, minWidth: '200px' }}>
          <span className="crud-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            className="crud-search-input"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          style={{
            padding: '0.5rem 0.85rem', borderRadius: '0.5rem',
            border: '1.5px solid #e5e7eb', background: '#fff',
            fontSize: '0.88rem', cursor: 'pointer', outline: 'none'
          }}
        >
          <option value="Todos">Todos</option>
          <option value="Pendiente">Pendiente aprobación</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Desactivado">Desactivado</option>
        </select>
      </div>

      {/* Tabla */}
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
              <tr>
                <td colSpan={6} className="td-empty">
                  No hay emprendedoras con este filtro
                </td>
              </tr>
            ) : usuariosPagina.map((u, i) => {
              const pendiente = esPendiente(u);
              const aprobado  = esAprobado(u);
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
                    {u.foto_documento ? (
                      <button className="btn-toggle btn-habilitar" onClick={() => setFotoModal(u)}>
                        Ver documento
                      </button>
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: "0.78rem" }}>—</span>
                    )}
                  </td>
                  <td className="td-actions">
                    {pendiente && (
                      <>
                        <button className="btn-toggle btn-habilitar" onClick={() => setModalData({ usuario: u, tipo: "aprobar" })}>
                          Aprobar
                        </button>
                        <button className="btn-toggle btn-inhabilitar" onClick={() => setModalData({ usuario: u, tipo: "rechazar" })}>
                          Rechazar
                        </button>
                      </>
                    )}
                    {aprobado && (
                      <button className="btn-toggle btn-inhabilitar" onClick={() => setModalData({ usuario: u, tipo: "toggle" })}>
                        Desactivar
                      </button>
                    )}
                    {!pendiente && !aprobado && (
                      <button className="btn-toggle btn-habilitar" onClick={() => setModalData({ usuario: u, tipo: "toggle" })}>
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="crud-pagination">
          <span className="pagination-info">
            {usuariosFiltrados.length} emprendedora{usuariosFiltrados.length !== 1 ? "s" : ""} · Página {pagina} de {totalPaginas}
          </span>
          <div className="pagination-controls">
            <button className="page-btn page-btn-arrow" onClick={() => setPagina(1)} disabled={pagina === 1}>«</button>
            <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
              <button key={n} className={`page-btn ${n === pagina ? "page-btn-active" : ""}`} onClick={() => setPagina(n)}>{n}</button>
            ))}
            <button className="page-btn page-btn-arrow" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>›</button>
            <button className="page-btn page-btn-arrow" onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>»</button>
          </div>
        </div>
      )}

      {/* Modal confirmar acción */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-card modal-confirm">
            <h2>Confirmar acción</h2>
            <p>
              ¿Seguro que deseas{" "}
              <strong>
                {modalData.tipo === "aprobar"  ? "aprobar"
                : modalData.tipo === "rechazar" ? "rechazar"
                : modalData.usuario.activo      ? "desactivar"
                :                                 "activar"}
              </strong>{" "}
              la cuenta de <strong>{modalData.usuario.nombre}</strong>?
            </p>
            {(modalData.tipo === "aprobar" || modalData.tipo === "rechazar") && modalData.usuario.foto_documento && (
              <div style={{ marginTop: "0.75rem" }}>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: "0.5rem" }}>Documento de identidad:</p>
                <img
                  src={modalData.usuario.foto_documento}
                  alt="Documento"
                  style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}
                />
              </div>
            )}
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalData(null)}>Cancelar</button>
              <button
                className={modalData.tipo === "rechazar" ? "btn-danger" : "btn-success"}
                onClick={ejecutarAccion}
              >
                {modalData.tipo === "aprobar"  ? "Sí, aprobar"
                : modalData.tipo === "rechazar" ? "Sí, rechazar"
                : modalData.usuario.activo      ? "Sí, desactivar"
                :                                 "Sí, activar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ver foto documento */}
      {fotoModal && (
        <div className="modal-overlay" onClick={() => setFotoModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>Documento de {fotoModal.nombre}</h2>
            </div>
            <img
              src={fotoModal.foto_documento}
              alt="Documento"
              style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #e5e7eb", margin: "1rem 0" }}
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setFotoModal(null)}>Cerrar</button>
              {esPendiente(fotoModal) && (
                <>
                  <button className="btn-danger" onClick={() => { setModalData({ usuario: fotoModal, tipo: "rechazar" }); setFotoModal(null) }}>
                    Rechazar
                  </button>
                  <button className="btn-primary" onClick={() => { setModalData({ usuario: fotoModal, tipo: "aprobar" }); setFotoModal(null) }}>
                    Aprobar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserManagement;
