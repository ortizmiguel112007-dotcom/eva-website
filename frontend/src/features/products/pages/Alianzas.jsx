import { useState, useEffect } from "react";
import { alianzaService } from "@/features/products/services/alianza.service";
import { useAuth } from "@/core/context/AuthConten";
import { FiCalendar, FiUserCheck, FiFlag } from "react-icons/fi";
import "@/infrastructure/css/alianzas.css";

// Colores para avatares
const AVATAR_COLORS = [
  "#3b82f6", "#059669", "#d97706", "#7c3aed",
  "#ef4444", "#0891b2", "#be185d", "#65a30d"
];

function getAvatarColor(nombre) {
  if (!nombre) return AVATAR_COLORS[0];
  const sum = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getInitials(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function Alianzas() {
  const { user } = useAuth();

  const [alianzas, setAlianzas]           = useState([]);
  const [emprendedoras, setEmprendedoras] = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [modal, setModal]                 = useState(false);
  const [guardando, setGuardando]         = useState(false);
  const [toast, setToast]                 = useState(null);

  const [form, setForm] = useState({
    nombre: "", descripcion: "", fecha_fin: "", id_invitada: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dataAlianzas, dataEmprendedoras] = await Promise.all([
          alianzaService.listar(),
          alianzaService.listarEmprendedoras(),
        ]);
        setAlianzas(dataAlianzas);
        setEmprendedoras(dataEmprendedoras);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const validar = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!form.id_invitada)   errors.id_invitada = "Debes seleccionar una emprendedora";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCrear = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      await alianzaService.crear({
        nombre:      form.nombre,
        descripcion: form.descripcion,
        fecha_fin:   form.fecha_fin || null,
        id_invitada: Number(form.id_invitada),
      });
      const nuevas = await alianzaService.listar();
      setAlianzas(nuevas);
      setModal(false);
      setForm({ nombre: "", descripcion: "", fecha_fin: "", id_invitada: "" });
      mostrarToast("Alianza creada correctamente");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al crear alianza");
    } finally {
      setGuardando(false);
    }
  };

  const handleAutorizar = async (id_alianza) => {
    try {
      const res = await alianzaService.autorizar(id_alianza);
      setAlianzas(prev => prev.map(a =>
        a.id_alianza === id_alianza
          ? {
              ...a,
              estado: res.activa ? "activa" : a.estado,
              participantes: a.participantes.map(p =>
                p.id_usuario === user.id ? { ...p, autorizado: true } : p
              )
            }
          : a
      ));
      mostrarToast(res.activa ? "¡Alianza activada!" : "Autorización registrada");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al autorizar");
    }
  };

  const handleFinalizar = async (id_alianza) => {
    try {
      await alianzaService.finalizar(id_alianza);
      setAlianzas(prev => prev.map(a =>
        a.id_alianza === id_alianza ? { ...a, estado: "finalizada" } : a
      ));
      mostrarToast("Alianza finalizada");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al finalizar");
    }
  };

  const formatFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : null;

  if (cargando) return <div className="alianzas-container"><p>Cargando alianzas...</p></div>;

  return (
    <div className="alianzas-container">

      {/* Header */}
      <div className="alianzas-header">
        <h1>Alianzas Promocionales</h1>
        <button className="btn-nueva-alianza" onClick={() => setModal(true)}>
          + Nueva Alianza
        </button>
      </div>

      {/* Métricas */}
      <div className="alianzas-metricas">
        <div className="alianza-metrica">
          <h3>{alianzas.length}</h3>
          <span>Total Alianzas</span>
        </div>
        <div className="alianza-metrica pendientes">
          <h3>{alianzas.filter(a => a.estado === "pendiente").length}</h3>
          <span>Pendientes</span>
        </div>
        <div className="alianza-metrica activas">
          <h3>{alianzas.filter(a => a.estado === "activa").length}</h3>
          <span>Activas</span>
        </div>
        <div className="alianza-metrica finalizadas">
          <h3>{alianzas.filter(a => a.estado === "finalizada").length}</h3>
          <span>Finalizadas</span>
        </div>
      </div>

      {/* Grid */}
      <div className="alianzas-grid">
        {alianzas.length === 0 ? (
          <div className="alianzas-empty">
            <p>No tienes alianzas todavía</p>
            <button className="btn-nueva-alianza" onClick={() => setModal(true)}>
              Crear primera alianza
            </button>
          </div>
        ) : (
          alianzas.map(alianza => {
            const miParticipacion = alianza.participantes.find(p => p.id_usuario === user.id);
            const puedoAutorizar  = miParticipacion && !miParticipacion.autorizado;
            const puedoFinalizar  = alianza.creada_por === user.id && alianza.estado !== "finalizada";

            return (
              <div key={alianza.id_alianza} className={`alianza-card ${alianza.estado}`}>

                {/* Header */}
                <div className="alianza-card-header">
                  <div>
                    <h3 className="alianza-nombre">{alianza.nombre}</h3>
                    {alianza.descripcion && (
                      <p className="alianza-descripcion">{alianza.descripcion}</p>
                    )}
                  </div>
                  <span className={`alianza-badge ${alianza.estado}`}>
                    {alianza.estado === "pendiente" ? "Pendiente" :
                     alianza.estado === "activa"    ? "Activa"    : "Finalizada"}
                  </span>
                </div>

                {/* Participantes */}
                <div className="alianza-participantes">
                  <span className="alianza-participantes-title">
                    Participantes ({alianza.participantes.length})
                  </span>
                  {alianza.participantes.map(p => (
                    <div key={p.id_usuario} className="alianza-participante">
                      <div className="alianza-participante-left">
                        <div
                          className="alianza-avatar"
                          style={{ background: getAvatarColor(p.usuario.nombre) }}
                        >
                          {getInitials(p.usuario.nombre)}
                        </div>
                        <span className="alianza-participante-nombre">{p.usuario.nombre}</span>
                      </div>
                      <span className={`alianza-participante-estado ${p.autorizado ? "ok" : "pendiente"}`}>
                        {p.autorizado ? "✓ Autorizado" : "⏳ Pendiente"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fechas */}
                <div className="alianza-fechas">
                  <div className="alianza-fecha-item">
                    <FiCalendar size={12} />
                    <span>Inicio: {formatFecha(alianza.fecha_inicio)}</span>
                  </div>
                  {alianza.fecha_fin && (
                    <div className="alianza-fecha-item">
                      <FiCalendar size={12} />
                      <span>Fin: {formatFecha(alianza.fecha_fin)}</span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                {(puedoAutorizar || puedoFinalizar) && (
                  <div className="alianza-card-actions">
                    {puedoAutorizar && (
                      <button className="btn-autorizar" onClick={() => handleAutorizar(alianza.id_alianza)}>
                        <FiUserCheck size={13} /> Autorizar participación
                      </button>
                    )}
                    {puedoFinalizar && (
                      <button className="btn-finalizar" onClick={() => handleFinalizar(alianza.id_alianza)}>
                        <FiFlag size={13} /> Finalizar
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="alianza-modal-overlay" onClick={() => setModal(false)}>
          <div className="alianza-modal" onClick={e => e.stopPropagation()}>
            <h3>Nueva Alianza</h3>

            <div className="alianza-modal-field">
              <label>Nombre de la alianza</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Campaña verano 2026"
              />
              {formErrors.nombre && <span className="alianza-modal-error">{formErrors.nombre}</span>}
            </div>

            <div className="alianza-modal-field">
              <label>Descripción (opcional)</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describe el objetivo de la alianza..."
              />
            </div>

            <div className="alianza-modal-field">
              <label>Invitar emprendedora</label>
              <select
                value={form.id_invitada}
                onChange={e => setForm(prev => ({ ...prev, id_invitada: e.target.value }))}
              >
                <option value="">Seleccionar emprendedora</option>
                {emprendedoras.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre} — {e.email}</option>
                ))}
              </select>
              {formErrors.id_invitada && <span className="alianza-modal-error">{formErrors.id_invitada}</span>}
            </div>

            <div className="alianza-modal-field">
              <label>Fecha de fin (opcional)</label>
              <input
                type="date"
                value={form.fecha_fin}
                onChange={e => setForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
              />
            </div>

            <div className="alianza-modal-buttons">
              <button className="btn-cancelar-alianza" onClick={() => setModal(false)}>
                Cancelar
              </button>
              <button className="btn-crear-alianza" onClick={handleCrear} disabled={guardando}>
                {guardando ? "Creando..." : "Crear alianza"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="alianzas-toast">{toast}</div>}

    </div>
  );
}