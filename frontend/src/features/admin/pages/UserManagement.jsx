import { useState, useEffect } from "react";
import { useAuth } from "@/core/context/AuthConten";
import { adminService } from "@/features/admin/services/admin.service";
import "@/infrastructure/css/AdminDashboard.css";

function UserManagement() {
  const { user } = useAuth();

  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [busqueda, setBusqueda]           = useState("");
  const [filtro, setFiltro]               = useState("Todos");
  const [toast, setToast]                 = useState(null);
  const [modalData, setModalData]         = useState(null);
  const [fotoModal, setFotoModal]         = useState(null);

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

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(null), 3000);
  };

  const confirmarAccion = (usuario, tipo) => setModalData({ usuario, tipo });

  const ejecutarAccion = async () => {
    if (!modalData) return;
    const { usuario, tipo } = modalData;
    if (tipo === "toggle")  await toggleActivo(usuario.id);
    if (tipo === "aprobar") await aprobar(usuario.id);
    setModalData(null);
  };

  const toggleActivo = async (id) => {
    try {
      const res = await adminService.toggleEstado(id);
      setListaUsuarios(prev =>
        prev.map(u => u.id === id ? { ...u, activo: res.usuario.activo } : u)
      );
      mostrarToast(res.message);
    } catch (err) {
      mostrarToast("Error al cambiar estado");
    }
  };

  const aprobar = async (id) => {
    try {
      const res = await adminService.aprobarEmprendedora(id);
      setListaUsuarios(prev =>
        prev.map(u => u.id === id ? { ...u, rol: "emprendedora", activo: true, emprendedora: res.emprendedora } : u)
      );
      mostrarToast("Emprendedora aprobada correctamente");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al aprobar");
    }
  };

  // emprendedora pendiente de aprobación: rol emprendedora, activo=false, tiene foto
  const esPendienteAprobacion = (u) =>
    u.rol === "emprendedora" && !u.activo && u.foto_documento;

  const usuariosFiltrados = listaUsuarios.filter(u => {
    const coincideBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());

    const coincideFiltro =
      filtro === "Todos"       ? true :
      filtro === "Desactivado" ? !u.activo && !esPendienteAprobacion(u) :
      filtro === "Pendiente"   ? esPendienteAprobacion(u) :
      filtro === "Aprobado"    ? u.activo && u.rol === "emprendedora" : true;

    return coincideBusqueda && coincideFiltro;
  });

  if (user?.rol !== "admin") return <h2>No autorizado</h2>;
  if (cargando) return <p>Cargando usuarios...</p>;

  return (
    <div className="card">

      {toast && <div className="toast">{toast}</div>}

    <h2>Gestión de Emprendedoras</h2>

      <div className="filtros-container">
        <div className="input-group">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input-buscador"
          />
        </div>
        <div className="select-group">
          <select
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="select-filtro"
          >
            <option value="Todos">Todos</option>
            <option value="Pendiente">Pendiente aprobación</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Desactivado">Desactivado</option>
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Rol</th>
            <th>Documento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map(u => {
            const pendiente = esPendienteAprobacion(u);
            return (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>

                <td>
                  <span className={
                    pendiente  ? "badge badge-pendiente"   :
                    !u.activo  ? "badge badge-desactivado" :
                                 "badge badge-aprobado"
                  }>
                    {pendiente  ? "Pendiente" :
                     !u.activo  ? "Desactivado"  :
                                  "Aprobado"}
                  </span>
                </td>

                <td>{u.rol}</td>

                <td>
                  {u.foto_documento ? (
                    <button
                      className="btn"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => setFotoModal(u)}
                    >
                      Ver documento
                    </button>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>—</span>
                  )}
                </td>

                <td>
                  {pendiente && (
                    <button
                      className="btn btn-success"
                      onClick={() => confirmarAccion(u, "aprobar")}
                    >
                      Aprobar
                    </button>
                  )}
                  <button
                    className={u.activo ? "btn btn-danger" : "btn btn-success"}
                    onClick={() => confirmarAccion(u, "toggle")}
                  >
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal confirmar acción */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar acción</h3>
            <p>
              ¿Seguro que deseas{" "}
              {modalData.tipo === "toggle"
                ? modalData.usuario.activo ? "desactivar" : "activar"
                : "aprobar"}{" "}
              la cuenta de <strong>{modalData.usuario.nombre}</strong>?
            </p>
            {modalData.tipo === "aprobar" && modalData.usuario.foto_documento && (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Documento de identidad:
                </p>
                <img
                  src={modalData.usuario.foto_documento}
                  alt="Documento"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                />
              </div>
            )}
            <div className="modal-buttons">
              <button className="btn btn-danger" onClick={ejecutarAccion}>
                Confirmar
              </button>
              <button className="btn" onClick={() => setModalData(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ver foto documento */}
      {fotoModal && (
        <div className="modal-overlay" onClick={() => setFotoModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3>Documento de {fotoModal.nombre}</h3>
            <img
              src={fotoModal.foto_documento}
              alt="Documento"
              style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid #e5e7eb', marginTop: '0.75rem' }}
            />
            <div className="modal-buttons" style={{ marginTop: '1rem' }}>
              <button className="btn" onClick={() => setFotoModal(null)}>
                Cerrar
              </button>
              {esPendienteAprobacion(fotoModal) && (
                <button
                  className="btn btn-success"
                  onClick={() => { confirmarAccion(fotoModal, "aprobar"); setFotoModal(null); }}
                >
                  Aprobar emprendedora
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserManagement;