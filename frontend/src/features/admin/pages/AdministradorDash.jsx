import { useState } from "react";
import UserManagement from "./UserManagement";
import RoleAssignment from "./RoleAssignment";
import AuditLog from "./AuditLog";

function AdminDashboard() {
  const [seccionActiva, setSeccionActiva] = useState("usuarios");

  return (
    <div className="admin-dashboard">
      <div className="admin-navbar">
        <h2>Panel Administrador</h2>
        <div className="nav-buttons">
          <button
            className={seccionActiva === "usuarios" ? "active" : ""}
            onClick={() => setSeccionActiva("usuarios")}
          >
            Gestión Usuarios
          </button>
          <button
            className={seccionActiva === "roles" ? "active" : ""}
            onClick={() => setSeccionActiva("roles")}
          >
            Asignación Roles
          </button>
          <button
            className={seccionActiva === "auditoria" ? "active" : ""}
            onClick={() => setSeccionActiva("auditoria")}
          >
            Auditoría
          </button>
        </div>
      </div>

      <div className="admin-content">
        {seccionActiva === "usuarios"  && <UserManagement />}
        {seccionActiva === "roles"     && <RoleAssignment />}
        {seccionActiva === "auditoria" && <AuditLog />}
      </div>
    </div>
  );
}

export default AdminDashboard;