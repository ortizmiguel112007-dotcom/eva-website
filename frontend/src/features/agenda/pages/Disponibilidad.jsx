import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiEdit2,
  FiMapPin,
  FiPlus,
  FiPower,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { agendaService } from "../services/agenda.service";
import MetricasCitas from "../components/MetricasCitas";
import ModalAccion from "../components/ModalAccion";
import ModalidadTag, { ICONO_MODALIDAD } from "../components/ModalidadTag";
import {
  DIAS_SEMANA,
  ETIQUETA_MODALIDAD,
  cortarHora,
  obtenerError,
} from "../utils/agenda.utils";
import "@/infrastructure/css/agenda/Agenda.css";

const FORM_INICIAL = {
  dia_semana: "1",
  hora_inicio: "09:00",
  hora_fin: "17:00",
  modalidad: "virtual",
  lugar: "",
};

export default function Disponibilidad() {
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [aDesactivar, setADesactivar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await agendaService.obtenerMiDisponibilidad();
      setHorarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(obtenerError(err, "No fue posible consultar tus horarios."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (!mensaje) return undefined;
    const t = setTimeout(() => setMensaje(""), 4000);
    return () => clearTimeout(t);
  }, [mensaje]);

  const cambiar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const reiniciarFormulario = () => {
    setForm(FORM_INICIAL);
    setEditandoId(null);
  };

  const empezarEdicion = (h) => {
    setEditandoId(h.id_disponibilidad);
    setForm({
      dia_semana: String(h.dia_semana),
      hora_inicio: cortarHora(h.hora_inicio),
      hora_fin: cortarHora(h.hora_fin),
      modalidad: h.modalidad,
      lugar: h.lugar ?? "",
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (form.hora_inicio >= form.hora_fin) {
      setError("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }
    if (form.modalidad !== "virtual" && !form.lugar.trim()) {
      setError(
        form.modalidad === "domicilio"
          ? "Indica la zona o barrios donde atiendes a domicilio."
          : "Indica el lugar de atención.",
      );
      return;
    }

    const payload = {
      dia_semana: Number(form.dia_semana),
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      modalidad: form.modalidad,
      lugar: form.modalidad === "virtual" ? null : form.lugar.trim(),
    };

    try {
      setGuardando(true);
      if (editandoId) {
        await agendaService.actualizarDisponibilidad(editandoId, payload);
        setMensaje("Horario actualizado correctamente.");
      } else {
        await agendaService.crearDisponibilidad(payload);
        setMensaje("Horario agregado correctamente.");
      }
      reiniciarFormulario();
      await cargar();
    } catch (err) {
      setError(obtenerError(err, "No fue posible guardar el horario."));
    } finally {
      setGuardando(false);
    }
  };

  const alternarActivo = async (h, activa) => {
    setError("");
    try {
      setProcesando(true);
      await agendaService.actualizarDisponibilidad(h.id_disponibilidad, { activa });
      setMensaje(activa ? "Horario reactivado." : "Horario desactivado.");
      setADesactivar(null);
      await cargar();
    } catch (err) {
      setError(obtenerError(err, "No fue posible actualizar el horario."));
      setADesactivar(null);
    } finally {
      setProcesando(false);
    }
  };

  const porDia = useMemo(
    () =>
      DIAS_SEMANA.map((d) => ({
        ...d,
        franjas: horarios
          .filter((h) => h.dia_semana === d.valor)
          .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
      })),
    [horarios],
  );

  const activos = horarios.filter((h) => h.activa);
  const metricas = [
    { etiqueta: "Franjas activas", valor: activos.length, Icono: FiClock, tono: "azul" },
    {
      etiqueta: "Días con atención",
      valor: new Set(activos.map((h) => h.dia_semana)).size,
      Icono: FiCalendar,
      tono: "verde",
    },
    {
      etiqueta: "Modalidades",
      valor: new Set(activos.map((h) => h.modalidad)).size,
      Icono: FiMapPin,
    },
    {
      etiqueta: "Desactivadas",
      valor: horarios.length - activos.length,
      Icono: FiPower,
    },
  ];

  return (
    <main className="ag-page">
      <header className="ag-encabezado">
        <div>
          <p className="ag-eyebrow">Panel de emprendedora</p>
          <h1>Mi disponibilidad</h1>
          <p className="ag-subtitulo">
            Define cuándo y cómo atiendes. Tus clientes solo podrán reservar
            dentro de estas franjas.
          </p>
        </div>
        <div className="ag-botones">
          <button
            type="button"
            className="ag-btn ag-btn--ghost"
            onClick={cargar}
            disabled={cargando}
          >
            <FiRefreshCw size={15} className={cargando ? "ag-girar-sin-fin" : ""} />
            Actualizar
          </button>
          <button
            type="button"
            className="ag-btn ag-btn--primario"
            onClick={() => navigate("/gestion-citas")}
          >
            <FiCalendar size={15} /> Ver citas
          </button>
        </div>
      </header>

      {error && (
        <div className="ag-alerta ag-alerta--error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            Cerrar
          </button>
        </div>
      )}
      {mensaje && (
        <div className="ag-alerta ag-alerta--exito" role="status">
          {mensaje}
        </div>
      )}

      <MetricasCitas items={metricas} />

      <div className="ag-disp">
        <form className="ag-card ag-disp-form" onSubmit={guardar}>
          <h2 className="ag-card-titulo">
            {editandoId ? <FiEdit2 size={17} /> : <FiPlus size={17} />}
            {editandoId ? "Editar horario" : "Agregar horario"}
          </h2>

          <label className="ag-campo">
            <span>Día de la semana</span>
            <select
              value={form.dia_semana}
              onChange={(e) => cambiar("dia_semana", e.target.value)}
            >
              {DIAS_SEMANA.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="ag-fila">
            <label className="ag-campo">
              <span>Desde</span>
              <input
                type="time"
                value={form.hora_inicio}
                onChange={(e) => cambiar("hora_inicio", e.target.value)}
                required
              />
            </label>
            <label className="ag-campo">
              <span>Hasta</span>
              <input
                type="time"
                value={form.hora_fin}
                onChange={(e) => cambiar("hora_fin", e.target.value)}
                required
              />
            </label>
          </div>

          <div className="ag-campo">
            <span>Modalidad</span>
            <div className="ag-chips">
              {Object.keys(ETIQUETA_MODALIDAD).map((m) => {
                const Icono = ICONO_MODALIDAD[m];
                return (
                  <button
                    key={m}
                    type="button"
                    className={`ag-chip ${form.modalidad === m ? "activo" : ""}`}
                    onClick={() => cambiar("modalidad", m)}
                  >
                    <Icono size={14} /> {ETIQUETA_MODALIDAD[m]}
                  </button>
                );
              })}
            </div>
          </div>

          {form.modalidad !== "virtual" && (
            <label className="ag-campo">
              <span>
                {form.modalidad === "domicilio"
                  ? "Zona de cobertura"
                  : "Lugar de atención"}
              </span>
              <input
                value={form.lugar}
                onChange={(e) => cambiar("lugar", e.target.value)}
                maxLength={200}
                placeholder={
                  form.modalidad === "domicilio"
                    ? "Ej: Laureles, Envigado, Sabaneta"
                    : "Dirección o nombre del local"
                }
              />
            </label>
          )}

          <div className="ag-botones">
            <button
              type="submit"
              className="ag-btn ag-btn--primario"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : editandoId
                  ? "Guardar cambios"
                  : "Agregar horario"}
            </button>
            {editandoId && (
              <button
                type="button"
                className="ag-btn ag-btn--ghost"
                onClick={reiniciarFormulario}
                disabled={guardando}
              >
                <FiX size={14} /> Cancelar
              </button>
            )}
          </div>
        </form>

        <section className="ag-semana" aria-label="Horario semanal">
          {cargando && horarios.length === 0 ? (
            <p className="ag-cargando">Cargando horarios...</p>
          ) : (
            porDia.map((dia) => (
              <div
                key={dia.valor}
                className={`ag-semana-dia ${dia.franjas.some((f) => f.activa) ? "con-atencion" : ""}`}
              >
                <h3>{dia.nombre}</h3>

                {dia.franjas.length === 0 ? (
                  <p className="ag-semana-libre">Sin atención</p>
                ) : (
                  <ul>
                    {dia.franjas.map((h) => (
                      <li
                        key={h.id_disponibilidad}
                        className={`ag-franja ${h.activa ? "" : "inactiva"} ${
                          editandoId === h.id_disponibilidad ? "editando" : ""
                        }`}
                      >
                        <div className="ag-franja-info">
                          <strong>
                            {cortarHora(h.hora_inicio)} – {cortarHora(h.hora_fin)}
                          </strong>
                          <ModalidadTag modalidad={h.modalidad} />
                          {h.lugar && (
                            <span className="ag-franja-lugar">
                              <FiMapPin size={12} /> {h.lugar}
                            </span>
                          )}
                          {!h.activa && (
                            <span className="ag-franja-estado">Desactivado</span>
                          )}
                        </div>

                        <div className="ag-franja-acciones">
                          <button
                            type="button"
                            className="ag-icono-btn"
                            onClick={() => empezarEdicion(h)}
                            aria-label="Editar horario"
                            title="Editar"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className={`ag-icono-btn ${h.activa ? "peligro" : "ok"}`}
                            onClick={() =>
                              h.activa
                                ? setADesactivar(h)
                                : alternarActivo(h, true)
                            }
                            disabled={procesando}
                            aria-label={
                              h.activa ? "Desactivar horario" : "Reactivar horario"
                            }
                            title={h.activa ? "Desactivar" : "Reactivar"}
                          >
                            <FiPower size={15} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </section>
      </div>

      {aDesactivar && (
        <ModalAccion
          titulo="¿Desactivar este horario?"
          descripcion="Tus clientes ya no podrán reservar en esta franja. Las citas ya solicitadas no se modifican y puedes reactivarla cuando quieras."
          confirmarTexto="Desactivar horario"
          tono="peligro"
          cargando={procesando}
          onConfirmar={() => alternarActivo(aDesactivar, false)}
          onCerrar={() => !procesando && setADesactivar(null)}
        >
          <p className="ag-modal-resumen">
            <strong>
              {DIAS_SEMANA.find((d) => d.valor === aDesactivar.dia_semana)?.nombre}
            </strong>{" "}
            · {cortarHora(aDesactivar.hora_inicio)} –{" "}
            {cortarHora(aDesactivar.hora_fin)} ·{" "}
            {ETIQUETA_MODALIDAD[aDesactivar.modalidad]}
          </p>
        </ModalAccion>
      )}
    </main>
  );
}