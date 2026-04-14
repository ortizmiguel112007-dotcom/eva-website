import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { adminService } from "@/features/admin/services/admin.service";
import { useAuth } from "@/core/context/AuthConten";
import "@/infrastructure/css/RoleAssignment.css";
import "@/infrastructure/css/CrudAdmin.css";

function RoleAssignment() {
  const { login } = useAuth();
  const [usuarios, setUsuarios]           = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [rolesTemporales, setRolesTemporales] = useState({});
  const [toast, setToast]                 = useState({ visible: false, mensaje: "", tipo: "ok" });
  const [busqueda, setBusqueda]           = useState("");
  const [pagina, setPagina]               = useState(1);
  const POR_PAGINA = 10;

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await adminService.listarUsuarios();
        setUsuarios(data);
      } catch (err) {
        console.error(err);
        mostrarToast("Error al cargar usuarios", "error");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => { setPagina(1); }, [busqueda]);

  const mostrarToast = (mensaje, tipo = "ok") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "ok" }), 3000);
  };

  const manejarCambio = (id, nuevoRol) => {
    setRolesTemporales((prev) => ({ ...prev, [id]: nuevoRol }));
  };

  const guardarRol = async (id) => {
    const nuevoRol = rolesTemporales[id];
    if (!nuevoRol) return mostrarToast("No hay cambios para guardar", "error");

    try {
      const res = await adminService.cambiarRol(id, nuevoRol);

      if (res.nuevoToken) {
        const tokenActual = localStorage.getItem("token");
        if (tokenActual) {
          const decoded = jwtDecode(tokenActual);
          if (decoded.id === id) {
            await login(res.nuevoToken);
            mostrarToast("Rol actualizado. Redirigiendo...");
            setTimeout(() => window.location.reload(), 1500);
            return;
          }
        }
      }

      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, rol: res.usuario.rol } : u)),
      );
      setRolesTemporales((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      mostrarToast("Rol actualizado correctamente");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al cambiar rol", "error");
      console.error(err);
    }
  };

  if (cargando)
    return <p style={{ padding: "2rem", color: "#64748b" }}>Cargando usuarios...</p>;

  const ROL_COLOR = {
    usuario:       { bg: "#eff6ff", color: "#2563eb" },
    emprendedora:  { bg: "#fff7ed", color: "#ab0cea" },
    administrador: { bg: "#f0fdf4", color: "#ff0000" },
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const totalPaginas   = Math.max(1, Math.ceil(usuariosFiltrados.length / POR_PAGINA));
  const usuariosPagina = usuariosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="roles-container">
      <div className="roles-card">
        <div style={{ marginBottom: "1.5rem" }}>
          <h3>Asignar Roles</h3>
          <p>Gestiona permisos y accesos de los usuarios</p>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            marginTop: "1rem", padding: "0.5rem 0.85rem",
            border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", background: "#fff",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "0.88rem", flex: 1, color: "#1e293b" }}
            />
          </div>
        </div>

        {usuariosFiltrados.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
            No hay usuarios registrados
          </p>
        ) : (
          usuariosPagina.map((u) => {
            const rolActual = rolesTemporales[u.id] || u.rol;
            const estilo    = ROL_COLOR[rolActual] || ROL_COLOR.usuario;
            const hayCambio = rolesTemporales[u.id] && rolesTemporales[u.id] !== u.rol;

            return (
              <div key={u.id} className="usuario-card">
                <div className="usuario-info">
                  <div style={{
                    width: "2.4rem", height: "2.4rem", borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0,
                  }}>
                    {u.nombre?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h4>{u.nombre}</h4>
                    <span>{u.email}</span>
                    <span style={{
                      display: "inline-block", marginTop: "0.2rem",
                      fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px",
                      borderRadius: "999px",
                      background: ROL_COLOR[u.rol]?.bg || "#f1f5f9",
                      color: ROL_COLOR[u.rol]?.color || "#374151",
                    }}>
                      {u.rol}
                    </span>
                  </div>
                </div>

                <div className="rol-actions">
                  <select
                    value={rolActual}
                    onChange={(e) => manejarCambio(u.id, e.target.value)}
                    className="select-rol"
                    style={{ background: estilo.bg, color: estilo.color, borderColor: estilo.color, fontWeight: 600 }}
                  >
                    <option value="administrador">Administrador</option>
                    <option value="emprendedora">Emprendedora</option>
                    <option value="usuario">Usuario</option>
                  </select>

                  <button
                    className={`btn-guardar ${hayCambio ? "btn-guardar-activo" : ""}`}
                    onClick={() => guardarRol(u.id)}
                    disabled={!hayCambio}
                    title={hayCambio ? "Guardar cambio de rol" : "Sin cambios"}
                  >
                    {hayCambio ? "Guardar" : "Sin cambios"}
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="crud-pagination">
            <span className="pagination-info">
              {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""} · Página {pagina} de {totalPaginas}
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
      </div>

      {toast.visible && (
        <div className={`toast-notificacion ${toast.tipo === "error" ? "toast-error" : ""}`}>
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}

export default RoleAssignment;
