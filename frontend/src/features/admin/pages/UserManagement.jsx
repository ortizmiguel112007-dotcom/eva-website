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

  // ── cargar usuarios del backend ──────────────────────────────────────────
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

  const confirmarAccion = (usuario, tipo) => {
    setModalData({ usuario, tipo });
  };

  const ejecutarAccion = async () => {
    if (!modalData) return;
    const { usuario, tipo } = modalData;
    if (tipo === "toggle")  await toggleActivo(usuario.id);
    if (tipo === "aprobar") await aprobar(usuario.id);
    setModalData(null);
  };

  // ── activar / desactivar ─────────────────────────────────────────────────
  const toggleActivo = async (id) => {
    try {
      const res = await adminService.toggleEstado(id);
      setListaUsuarios((prev) =>
        prev.map((u) => u.id === id ? { ...u, activo: res.usuario.activo } : u)
      );
      mostrarToast(res.message);
    } catch (err) {
      mostrarToast("Error al cambiar estado");
      console.error(err);
    }
  };

  // ── aprobar emprendedora ─────────────────────────────────────────────────
  const aprobar = async (id) => {
    try {
      const res = await adminService.aprobarEmprendedora(id);
      setListaUsuarios((prev) =>
        prev.map((u) => u.id === id ? { ...u, rol: "emprendedora", emprendedora: res.emprendedora } : u)
      );
      mostrarToast("Emprendedora aprobada correctamente");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al aprobar");
      console.error(err);
    }
  };

  // ── filtrado ─────────────────────────────────────────────────────────────
  const usuariosFiltrados = listaUsuarios.filter((u) => {
    const coincideBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());

    const coincideFiltro =
      filtro === "Todos"       ? true :
      filtro === "Desactivado" ? !u.activo :
      filtro === "Pendiente"   ? u.activo && !u.emprendedora && u.rol !== "admin" :
      filtro === "Aprobado"    ? !!u.emprendedora : true;

    return coincideBusqueda && coincideFiltro;
  });

  if (user?.rol !== "admin") return <h2>No autorizado</h2>;
  if (cargando) return <p>Cargando usuarios...</p>;

  return (
    <div className="card">

      {toast && <div className="toast">{toast}</div>}

      <h2>Gestión de Usuarios</h2>

      <div className="filtros-container">
        <div className="input-group">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-buscador"
          />
        </div>

        <div className="select-group">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="select-filtro"
          >
            <option value="Todos">Todos</option>
            <option value="Pendiente">Pendiente</option>
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
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuariosFiltrados.map((u) => {
            const esPendiente = u.activo && !u.emprendedora && u.rol !== "administrador";
            return (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>

                <td>
                  <span className={
                    !u.activo          ? "badge badge-desactivado" :
                    esPendiente        ? "badge badge-pendiente"   :
                                         "badge badge-aprobado"
                  }>
                    {!u.activo ? "Desactivado" : esPendiente ? "Pendiente" : "Aprobado"}
                  </span>
                </td>

                <td>{u.rol}</td>

                <td>
                  {esPendiente && (
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

      {modalData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar acción</h3>
            <p>
              ¿Seguro que deseas{" "}
              {modalData.tipo === "toggle"
                ? modalData.usuario.activo ? "desactivar" : "activar"
                : "aprobar"}{" "}
              la cuenta de {modalData.usuario.nombre}?
            </p>
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
    </div>
  );
}

export default UserManagement;