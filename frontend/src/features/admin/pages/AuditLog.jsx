import { useEffect, useState } from "react";
import { adminService } from "@/features/admin/services/admin.service";
import "@/infrastructure/css/Auditoria.css";

function AuditLog() {
  const [registros, setRegistros]         = useState([]);
  const [usuariosActivos, setUsuariosActivos] = useState(0);
  const [cargando, setCargando]           = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [auditoria, usuarios] = await Promise.all([
          adminService.listarAuditoria(),
          adminService.listarUsuarios(),
        ]);
        setRegistros(auditoria);
        setUsuariosActivos(usuarios.filter((u) => u.activo).length);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const hoy = new Date().toLocaleDateString();
  const accionesHoy = registros.filter((r) =>
    new Date(r.fecha).toLocaleDateString() === hoy
  ).length;

  if (cargando) return <p>Cargando auditoría...</p>;

  return (
    <div className="auditoria-container">
      <div className="bienvenida-card">
        <h2>Registro de Auditoría</h2>
        <p>Historial de actividades del sistema</p>
      </div>

      {/* MÉTRICAS */}
      <div className="metricas">
        <div className="metrica-card">
          <h3>{registros.length}</h3>
          <span>Acciones Totales</span>
        </div>
        <div className="metrica-card">
          <h3>{usuariosActivos}</h3>
          <span>Usuarios Activos</span>
        </div>
        <div className="metrica-card">
          <h3>{accionesHoy}</h3>
          <span>Acciones Hoy</span>
        </div>
      </div>

      <div className="lista-auditoria">
        {registros.length === 0 && (
          <p style={{ textAlign: "center" }}>No hay registros todavía.</p>
        )}

        {registros.map((r) => (
          <div key={r.id_auditoria} className="registro">
            <div className="registro-info">
              <h4>{r.accion}</h4>
              <p>{r.detalles}</p>
              <span>Por {r.usuario?.nombre || "Sistema"}</span>
            </div>
            <div className="registro-fecha">
              {new Date(r.fecha).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuditLog;