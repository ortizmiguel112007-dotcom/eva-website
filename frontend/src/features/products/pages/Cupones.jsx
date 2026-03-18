import { useState, useEffect } from "react";
import {
  FiPlus, FiCalendar, FiTrash2, FiToggleLeft, FiToggleRight,
  FiTag, FiPercent, FiDollarSign, FiCheckCircle, FiXCircle,
  FiClock, FiAlertCircle, FiGift
} from "react-icons/fi";
import { cuponService } from "@/features/products/services/cupon.service";
import "@/infrastructure/css/cupones.css";

const FORM_INICIAL = {
  codigo:      "",
  tipo:        "porcentaje",
  valor:       "",
  descripcion: "",
  fecha_fin:   "",
  limite_usos: "",
};

export default function Cupones() {
  const [cupones, setCupones]       = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState({});
  const [guardando, setGuardando]   = useState(false);
  const [toast, setToast]           = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await cuponService.listar();
        setCupones(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const mostrarToast = (msg, tipo = "success") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const getEstado = (cupon) => {
    if (cupon.fecha_fin && new Date() > new Date(cupon.fecha_fin)) return "expirado";
    if (cupon.limite_usos && cupon.usos >= cupon.limite_usos)       return "agotado";
    if (!cupon.activo)                                               return "inactivo";
    return "activo";
  };

  const getEstadoLabel = (estado) => ({
    activo:   "Activo",
    inactivo: "Inactivo",
    expirado: "Expirado",
    agotado:  "Agotado",
  })[estado] ?? estado;

  const getEstadoIcon = (estado) => {
    const props = { size: 12, style: { flexShrink: 0 } };
    return {
      activo:   <FiCheckCircle  {...props} />,
      inactivo: <FiXCircle      {...props} />,
      expirado: <FiAlertCircle  {...props} />,
      agotado:  <FiClock        {...props} />,
    }[estado] ?? null;
  };

  const validar = () => {
    const errors = {};
    if (!form.codigo.trim()) errors.codigo = "El código es obligatorio";
    if (!form.valor)         errors.valor  = "El valor es obligatorio";
    if (form.tipo === "porcentaje" && (Number(form.valor) < 1 || Number(form.valor) > 100))
      errors.valor = "El porcentaje debe estar entre 1 y 100";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCrear = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      await cuponService.crear({
        codigo:      form.codigo.toUpperCase(),
        tipo:        form.tipo,
        valor:       Number(form.valor),
        descripcion: form.descripcion || null,
        fecha_fin:   form.fecha_fin   || null,
        limite_usos: form.limite_usos ? Number(form.limite_usos) : null,
      });
      const data = await cuponService.listar();
      setCupones(data);
      setModal(false);
      setForm(FORM_INICIAL);
      mostrarToast("Cupón creado correctamente");
    } catch (err) {
      mostrarToast(err.response?.data?.error || "Error al crear cupón", "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggle = async (id_cupon) => {
    try {
      const res = await cuponService.toggle(id_cupon);
      setCupones(prev =>
        prev.map(c => c.id_cupon === id_cupon ? { ...c, activo: res.cupon.activo } : c)
      );
      mostrarToast(res.message);
    } catch {
      mostrarToast("Error al cambiar estado", "error");
    }
  };

  const handleEliminar = async (id_cupon) => {
    if (!confirm("¿Seguro que quieres eliminar este cupón?")) return;
    try {
      await cuponService.eliminar(id_cupon);
      setCupones(prev => prev.filter(c => c.id_cupon !== id_cupon));
      mostrarToast("Cupón eliminado");
    } catch {
      mostrarToast("Error al eliminar", "error");
    }
  };

  const formatFecha = (fecha) =>
    fecha
      ? new Date(fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  const formatValor = (cupon) =>
    cupon.tipo === "porcentaje"
      ? `${Number(cupon.valor)}%`
      : `$${Number(cupon.valor).toLocaleString("es-CO")}`;

  const getFechaClase = (fecha_fin) => {
    if (!fecha_fin) return "";
    const dias = Math.ceil((new Date(fecha_fin) - new Date()) / (1000 * 60 * 60 * 24));
    if (dias < 0)  return "expirada";
    if (dias <= 7) return "vence-pronto";
    return "";
  };

  if (cargando) return (
    <div className="cupones-container">
      <div className="cupones-loading">
        <FiGift size={28} />
        <span>Cargando cupones...</span>
      </div>
    </div>
  );

  return (
    <div className="cupones-container">

      {/* ── Header ── */}
      <div className="cupones-header">
        <h1>
          {/* <FiTag size={22} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} /> */}
          Cupones de Descuento
        </h1>
        <button className="btn-nuevo-cupon" onClick={() => setModal(true)}>
          <FiPlus size={16} />
          Nuevo Cupón
        </button>
      </div>

      {/* ── Métricas ── */}
      <div className="cupones-metricas">
        <div className="cupon-metrica">
          <h3>{cupones.length}</h3>
          <span>Total cupones</span>
        </div>
        <div className="cupon-metrica activos">
          <h3>{cupones.filter(c => getEstado(c) === "activo").length}</h3>
          <span>
            <FiCheckCircle size={11} style={{ marginRight: "0.3rem", verticalAlign: "middle" }} />
            Activos
          </span>
        </div>
        <div className="cupon-metrica expirados">
          <h3>{cupones.filter(c => getEstado(c) === "expirado").length}</h3>
          <span>
            <FiAlertCircle size={11} style={{ marginRight: "0.3rem", verticalAlign: "middle" }} />
            Expirados
          </span>
        </div>
        <div className="cupon-metrica">
          <h3>{cupones.reduce((acc, c) => acc + c.usos, 0)}</h3>
          <span>Usos totales</span>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="cupones-tabla-wrapper">
        {cupones.length === 0 ? (
          <div className="cupones-empty">
            <FiGift size={36} style={{ marginBottom: "0.75rem", opacity: 0.35 }} />
            <p>No tienes cupones todavía</p>
            <button className="btn-nuevo-cupon" onClick={() => setModal(true)} style={{ marginTop: "0.75rem" }}>
              <FiPlus size={14} /> Crear primer cupón
            </button>
          </div>
        ) : (
          <table className="cupones-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descuento</th>
                <th>Usos</th>
                <th>Vence</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cupones.map(cupon => {
                const estado = getEstado(cupon);
                const pct = cupon.limite_usos
                  ? Math.min((cupon.usos / cupon.limite_usos) * 100, 100)
                  : null;

                return (
                  <tr key={cupon.id_cupon}>

                    {/* Código */}
                    <td>
                      <span className="cupon-codigo">{cupon.codigo}</span>
                      {cupon.descripcion && (
                        <div className="cupon-descripcion">{cupon.descripcion}</div>
                      )}
                    </td>

                    {/* Descuento */}
                    <td>
                      <span className={`cupon-descuento-pill ${cupon.tipo}`}>
                        {cupon.tipo === "porcentaje"
                          ? <FiPercent size={11} />
                          : <FiDollarSign size={11} />
                        }
                        {formatValor(cupon)}
                      </span>
                    </td>

                    {/* Usos + barra */}
                    <td>
                      <div className="cupon-usos-wrapper">
                        <span className="cupon-usos-texto">
                          {cupon.usos}
                          {cupon.limite_usos && (
                            <span className="cupon-usos-limite"> / {cupon.limite_usos}</span>
                          )}
                        </span>
                        {pct !== null && (
                          <div className="cupon-usos-bar">
                            <div
                              className={`cupon-usos-bar-fill ${pct >= 100 ? "lleno" : ""}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Fecha */}
                    <td>
                      <span className={`cupon-fecha ${getFechaClase(cupon.fecha_fin)}`}>
                        <FiCalendar size={12} />
                        {formatFecha(cupon.fecha_fin)}
                      </span>
                    </td>

                    {/* Estado */}
                    <td>
                      <span className={`cupon-estado ${estado}`}>
                        {getEstadoIcon(estado)}
                        {getEstadoLabel(estado)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td>
                      <div className="cupon-acciones">
                        {estado !== "expirado" && estado !== "agotado" && (
                          <button
                            className={`btn-toggle-cupon ${cupon.activo ? "desactivar" : "activar"}`}
                            onClick={() => handleToggle(cupon.id_cupon)}
                            title={cupon.activo ? "Desactivar cupón" : "Activar cupón"}
                          >
                            {cupon.activo
                              ? <FiToggleRight size={14} />
                              : <FiToggleLeft  size={14} />
                            }
                            {cupon.activo ? "Desactivar" : "Activar"}
                          </button>
                        )}
                        <button
                          className="btn-eliminar-cupon"
                          onClick={() => handleEliminar(cupon.id_cupon)}
                          title="Eliminar cupón"
                        >
                          <FiTrash2 size={13} />
                          Eliminar
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal nuevo cupón ── */}
      {modal && (
        <div className="cupon-modal-overlay" onClick={() => setModal(false)}>
          <div className="cupon-modal" onClick={e => e.stopPropagation()}>

            <div className="cupon-modal-header">
              <FiGift size={20} />
              <h3>Nuevo Cupón</h3>
            </div>

            <div className="cupon-modal-row">
              <div className="cupon-modal-field">
                <label>Código</label>
                <div className="cupon-input-icon-wrapper">
                  <FiTag size={14} className="cupon-input-icon" />
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={e => setForm(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
                    placeholder="Ej: VERANO20"
                    className="with-icon"
                  />
                </div>
                {formErrors.codigo && (
                  <span className="cupon-modal-error">
                    <FiAlertCircle size={11} /> {formErrors.codigo}
                  </span>
                )}
              </div>
              <div className="cupon-modal-field">
                <label>Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))}
                >
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="valor_fijo">Valor fijo ($)</option>
                </select>
              </div>
            </div>

            <div className="cupon-modal-field">
              <label>{form.tipo === "porcentaje" ? "Porcentaje (1–100)" : "Valor de descuento"}</label>
              <div className="cupon-input-icon-wrapper">
                {form.tipo === "porcentaje"
                  ? <FiPercent size={14} className="cupon-input-icon" />
                  : <FiDollarSign size={14} className="cupon-input-icon" />
                }
                <input
                  type="number"
                  min="1"
                  max={form.tipo === "porcentaje" ? "100" : undefined}
                  value={form.valor}
                  onChange={e => setForm(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder={form.tipo === "porcentaje" ? "Ej: 20" : "Ej: 10000"}
                  className="with-icon"
                />
              </div>
              {formErrors.valor && (
                <span className="cupon-modal-error">
                  <FiAlertCircle size={11} /> {formErrors.valor}
                </span>
              )}
            </div>

            <div className="cupon-modal-field">
              <label>Descripción <span className="cupon-modal-hint">(opcional)</span></label>
              <input
                type="text"
                value={form.descripcion}
                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Ej: Descuento de temporada"
              />
            </div>

            <div className="cupon-modal-row">
              <div className="cupon-modal-field">
                <label>Fecha de vencimiento <span className="cupon-modal-hint">(opcional)</span></label>
                <div className="cupon-input-icon-wrapper">
                  <FiCalendar size={14} className="cupon-input-icon" />
                  <input
                    type="date"
                    value={form.fecha_fin}
                    onChange={e => setForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
                    className="with-icon"
                  />
                </div>
              </div>
              <div className="cupon-modal-field">
                <label>Límite de usos <span className="cupon-modal-hint">(opcional)</span></label>
                <input
                  type="number"
                  min="1"
                  value={form.limite_usos}
                  onChange={e => setForm(prev => ({ ...prev, limite_usos: e.target.value }))}
                  placeholder="Sin límite"
                />
              </div>
            </div>

            <div className="cupon-modal-buttons">
              <button
                className="btn-cancelar-cupon"
                onClick={() => { setModal(false); setForm(FORM_INICIAL); }}
              >
                Cancelar
              </button>
              <button className="btn-crear-cupon" onClick={handleCrear} disabled={guardando}>
                {guardando
                  ? <><FiClock size={14} /> Creando...</>
                  : <><FiPlus  size={14} /> Crear cupón</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`cupones-toast ${toast.tipo}`}>
          {toast.tipo === "success"
            ? <FiCheckCircle size={15} style={{ marginRight: "0.4rem" }} />
            : <FiXCircle     size={15} style={{ marginRight: "0.4rem" }} />
          }
          {toast.msg}
        </div>
      )}

    </div>
  );
}