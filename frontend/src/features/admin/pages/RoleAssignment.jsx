import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/admin.service";
import "@/infrastructure/css/RoleAssignment.css";

function RoleAssignment() {
  const [usuarios, setUsuarios]           = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [rolesTemporales, setRolesTemporales] = useState({});
  const [toast, setToast]                 = useState({ visible: false, mensaje: "" });

  // ── cargar usuarios ──────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await adminService.listarUsuarios();
        setUsuarios(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const mostrarToast = (mensaje) => {
    setToast({ visible: true, mensaje });
    setTimeout(() => setToast({ visible: false, mensaje: "" }), 3000);
  };

  const manejarCambio = (id, nuevoRol) => {
    setRolesTemporales({ ...rolesTemporales, [id]: nuevoRol });
  };

  const guardarRol = async (id) => {
    const nuevoRol = rolesTemporales[id];
    if (!nuevoRol) return mostrarToast("No hay cambios para guardar");

    try {
      const res = await adminService.cambiarRol(id, nuevoRol);
      setUsuarios((prev) =>
        prev.map((u) => u.id === id ? { ...u, rol: res.usuario.rol } : u)
      );
      setRolesTemporales((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      mostrarToast("Rol actualizado correctamente");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al cambiar rol");
      console.error(err);
    }
  };

  if (cargando) return <p>Cargando usuarios...</p>;

  return (
    <div className="roles-container">
      <div className="roles-card">
        <h3>Asignar Roles</h3>
        <p>Gestiona permisos y accesos</p>

        {usuarios.map((u) => (
          <div key={u.id} className="usuario-card">
            <div>
              <h4>{u.nombre}</h4>
              <span>{u.email}</span>
            </div>

            <div className="rol-actions">
              <select
                value={rolesTemporales[u.id] || u.rol}
                onChange={(e) => manejarCambio(u.id, e.target.value)}
                className="select-rol"
              >
                <option value="administrador">Administrador</option>
                <option value="emprendedora">Emprendedora</option>
                <option value="usuario">Usuario</option>
              </select>

              <button
                className="btn-guardar"
                onClick={() => guardarRol(u.id)}
              >
                Guardar
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast.visible && (
        <div className="toast-notificacion">
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}

export default RoleAssignment;