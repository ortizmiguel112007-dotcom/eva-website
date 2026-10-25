import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiMapPin,
  FiRefreshCw,
  FiUser,
  FiX,
} from "react-icons/fi";
import { agendaService } from "../services/agenda.service";
import EstadoBadge from "../components/EstadoBadge";
import MetricasCitas from "../components/MetricasCitas";
import ModalAccion from "../components/ModalAccion";
import ModalidadTag, { ICONO_MODALIDAD } from "../components/ModalidadTag";
import HistorialCambios from "../components/HistorialCambios";
import SelectorHorarios from "../components/SelectorHorarios";
import {
  DESCRIPCION_MODALIDAD,
  ETIQUETA_MODALIDAD,
  esFutura,
  esHistorial,
  formatearDuracion,
  formatearFechaHora,
  formatearPrecio,
  formatearRangoHora,
  obtenerError,
  partesFecha,
  tieneCambioPendiente,
} from "../utils/agenda.utils";
import "@/infrastructure/css/agenda/Agenda.css";

const TABS = [
  { clave: "todas", etiqueta: "Todas" },
  { clave: "pendientes", etiqueta: "Pendientes" },
  { clave: "proximas", etiqueta: "Próximas" },
  { clave: "historial", etiqueta: "Historial" },
];

const FILTROS = {
  todas: () => true,
  pendientes: (c) => c.estado === "PENDIENTE",
  proximas: (c) => c.estado === "CONFIRMADA" && esFutura(c.fecha_fin),
  historial: esHistorial,
};

const ORDEN_MODALIDADES = ["virtual", "presencial", "domicilio"];

/* ── Modal: proponer cambio de fecha y hora (RF-108) ─────────── */
function ModalCambioHorario({ cita, onCerrar, onEnviado }) {
  const [franjas, setFranjas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalidad, setModalidad] = useState(cita.modalidad);
  const [horario, setHorario] = useState(null);
  const [direccion, setDireccion] = useState(
    cita.modalidad === "domicilio" ? (cita.lugar ?? "") : "",
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const lista = await agendaService.obtenerDisponibilidadPublica(
          cita.id_emprendedora,
        );
        if (activo) setFranjas(Array.isArray(lista) ? lista : []);
      } catch (err) {
        if (activo) {
          setError(obtenerError(err, "No se pudo consultar la disponibilidad."));
        }
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [cita.id_emprendedora]);

  const modalidades = useMemo(
    () => ORDEN_MODALIDADES.filter((m) => franjas.some((f) => f.modalidad === m)),
    [franjas],
  );

  const diasHabilitados = useMemo(
    () =>
      new Set(
        franjas.filter((f) => f.modalidad === modalidad).map((f) => f.dia_semana),
      ),
    [franjas, modalidad],
  );

  const enviar = async () => {
    setError("");
    if (!horario) {
      setError("Selecciona el nuevo día y hora.");
      return;
    }
    if (modalidad === "domicilio" && !direccion.trim()) {
      setError("Indica la dirección para la atención a domicilio.");
      return;
    }

    try {
      setEnviando(true);
      const r = await agendaService.proponerCambioCita(cita.id_cita, {
        fecha_inicio: horario.inicio,
        modalidad,
        ...(modalidad === "domicilio" ? { lugar: direccion.trim() } : {}),
      });
      onEnviado(r.message);
    } catch (err) {
      setError(obtenerError(err, "No se pudo enviar la propuesta."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="ag-overlay"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !enviando && onCerrar()}
    >
      <div
        className="ag-modal ag-modal--ancho"
        role="dialog"
        aria-modal="true"
        aria-label="Proponer cambio de horario"
      >
        <button
          type="button"
          className="ag-modal-cerrar"
          onClick={onCerrar}
          disabled={enviando}
          aria-label="Cerrar"
        >
          <FiX size={18} />
        </button>

        <h2>Proponer cambio de horario</h2>
        <p className="ag-modal-desc">
          {cita.servicio?.nombre_producto} · Actualmente:{" "}
          <strong>{formatearFechaHora(cita.fecha_inicio)}</strong>
        </p>

        {cargando ? (
          <p className="ag-cargando">Cargando horarios...</p>
        ) : modalidades.length === 0 ? (
          <div className="ag-alerta ag-alerta--error">
            La emprendedora no tiene horarios habilitados en este momento.
          </div>
        ) : (
          <>
            <p className="ag-selector-etiqueta">Modalidad</p>
            <div className="ag-chips">
              {modalidades.map((m) => {
                const Icono = ICONO_MODALIDAD[m];
                return (
                  <button
                    key={m}
                    type="button"
                    className={`ag-chip ${modalidad === m ? "activo" : ""}`}
                    onClick={() => setModalidad(m)}
                    title={DESCRIPCION_MODALIDAD[m]}
                  >
                    <Icono size={14} /> {ETIQUETA_MODALIDAD[m]}
                  </button>
                );
              })}
            </div>

            <SelectorHorarios
              idProducto={cita.servicio?.id_producto ?? cita.id_producto}
              modalidad={modalidad}
              diasHabilitados={diasHabilitados}
              valor={horario}
              onChange={setHorario}
            />

            {modalidad === "domicilio" && (
              <label className="ag-campo">
                <span>Dirección del servicio</span>
                <input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  maxLength={200}
                  placeholder="Barrio, calle, número y referencias"
                />
              </label>
            )}

            <p className="ag-nota">
              Tu cita conserva su horario actual hasta que la emprendedora
              acepte la propuesta.
            </p>
          </>
        )}

        {error && (
          <div className="ag-alerta ag-alerta--error" role="alert">
            {error}
          </div>
        )}

        <div className="ag-modal-acciones">
          <button
            type="button"
            className="ag-btn ag-btn--ghost"
            onClick={onCerrar}
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="ag-btn ag-btn--primario"
            onClick={enviar}
            disabled={enviando || !horario}
          >
            {enviando ? "Enviando..." : "Enviar propuesta"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta de cita ─────────────────────────────────────────── */
function CitaCard({ cita, onCambiar, onCancelar }) {
  const [verHistorial, setVerHistorial] = useState(false);
  const { dia, mes, diaSemana } = partesFecha(cita.fecha_inicio);
  const futura = esFutura(cita.fecha_inicio);
  const cambios = Array.isArray(cita.cambios) ? cita.cambios : [];
  const cambioPendiente = tieneCambioPendiente(cita);
  const nombreEmprendedora = cita.emprendedora?.usuario?.nombre;

  const puedeCambiar = cita.estado === "CONFIRMADA" && futura && !cambioPendiente;
  const puedeCancelar =
    ["PENDIENTE", "CONFIRMADA"].includes(cita.estado) && futura;

  return (
    <article className={`ag-cita ag-cita--${cita.estado.toLowerCase()}`}>
      <div className="ag-cita-fecha" aria-hidden="true">
        <small>{diaSemana}</small>
        <strong>{dia}</strong>
        <small>{mes}</small>
      </div>

      <div className="ag-cita-cuerpo">
        <div className="ag-cita-top">
          <div>
            <h3>{cita.servicio?.nombre_producto ?? "Servicio"}</h3>
            {nombreEmprendedora && (
              <p className="ag-cita-sub">
                <FiUser size={13} /> {nombreEmprendedora}
              </p>
            )}
          </div>
          <EstadoBadge estado={cita.estado} />
        </div>

        <ul className="ag-cita-datos">
          <li>
            <FiClock size={14} />
            {formatearRangoHora(cita.fecha_inicio, cita.fecha_fin)}
            <span className="ag-muted">
              · {formatearDuracion(cita.servicio?.duracion)}
            </span>
          </li>
          <li>
            <ModalidadTag modalidad={cita.modalidad} />
          </li>
          {cita.lugar && (
            <li>
              <FiMapPin size={14} /> {cita.lugar}
            </li>
          )}
          {cita.servicio?.precio != null && (
            <li className="ag-muted">{formatearPrecio(cita.servicio.precio)}</li>
          )}
        </ul>

        {cita.observaciones && (
          <p className="ag-cita-obs">
            <strong>Tus observaciones:</strong> {cita.observaciones}
          </p>
        )}

        {cita.estado === "PENDIENTE" && (
          <p className="ag-aviso ag-aviso--ambar">
            Esperando que la emprendedora responda tu solicitud.
          </p>
        )}
        {cita.motivo_rechazo && ["RECHAZADA", "CANCELADA"].includes(cita.estado) && (
          <p className="ag-aviso ag-aviso--rojo">
            <strong>
              {cita.estado === "RECHAZADA" ? "Motivo del rechazo" : "Motivo"}:
            </strong>{" "}
            {cita.motivo_rechazo}
          </p>
        )}
        {cambioPendiente && cita.estado === "CONFIRMADA" && (
          <p className="ag-aviso ag-aviso--azul">
            Tienes una propuesta de cambio esperando respuesta.
          </p>
        )}

        {(puedeCambiar || puedeCancelar || cambios.length > 0) && (
          <div className="ag-cita-acciones">
            {puedeCambiar && (
              <button
                type="button"
                className="ag-btn ag-btn--primario ag-btn--sm"
                onClick={() => onCambiar(cita)}
              >
                <FiRefreshCw size={14} /> Proponer cambio
              </button>
            )}
            {puedeCancelar && (
              <button
                type="button"
                className="ag-btn ag-btn--peligro-suave ag-btn--sm"
                onClick={() => onCancelar(cita)}
              >
                Cancelar cita
              </button>
            )}
            {cambios.length > 0 && (
              <button
                type="button"
                className="ag-btn ag-btn--ghost ag-btn--sm ag-btn--der"
                onClick={() => setVerHistorial((v) => !v)}
                aria-expanded={verHistorial}
              >
                Historial ({cambios.length})
                <FiChevronDown
                  size={14}
                  className={verHistorial ? "ag-girar" : ""}
                />
              </button>
            )}
          </div>
        )}

        {verHistorial && <HistorialCambios cambios={cambios} />}
      </div>
    </article>
  );
}

/* ── Página ──────────────────────────────────────────────────── */
export default function MisCitas() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tab, setTab] = useState("todas");

  const [citaCambio, setCitaCambio] = useState(null);
  const [citaCancelar, setCitaCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelar, setErrorCancelar] = useState("");

  const cargarCitas = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await agendaService.obtenerMisCitas();
      setCitas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(obtenerError(err, "No fue posible cargar tus citas."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  useEffect(() => {
    if (!mensaje) return undefined;
    const t = setTimeout(() => setMensaje(""), 5000);
    return () => clearTimeout(t);
  }, [mensaje]);

  const metricas = useMemo(
    () => [
      { etiqueta: "Total de citas", valor: citas.length, Icono: FiCalendar },
      {
        etiqueta: "Pendientes",
        valor: citas.filter(FILTROS.pendientes).length,
        Icono: FiAlertCircle,
        tono: "ambar",
      },
      {
        etiqueta: "Próximas",
        valor: citas.filter(FILTROS.proximas).length,
        Icono: FiClock,
        tono: "azul",
      },
      {
        etiqueta: "Completadas",
        valor: citas.filter(
          (c) => c.estado === "CONFIRMADA" && !esFutura(c.fecha_fin),
        ).length,
        Icono: FiCheckCircle,
        tono: "verde",
      },
    ],
    [citas],
  );

  const visibles = useMemo(() => {
    const lista = citas.filter(FILTROS[tab]);
    // Próximas primero (ascendente); el resto, de más reciente a más antigua.
    return tab === "proximas" || tab === "pendientes"
      ? [...lista].sort(
          (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
        )
      : lista;
  }, [citas, tab]);

  const confirmarCancelacion = async (motivo) => {
    try {
      setCancelando(true);
      setErrorCancelar("");
      const r = await agendaService.cancelarCita(citaCancelar.id_cita, motivo);
      setMensaje(r.message ?? "La cita fue cancelada.");
      setCitaCancelar(null);
      await cargarCitas();
    } catch (err) {
      setErrorCancelar(obtenerError(err, "No se pudo cancelar la cita."));
    } finally {
      setCancelando(false);
    }
  };

  if (cargando && citas.length === 0) {
    return (
      <main className="ag-page">
        <p className="ag-cargando">Cargando tus citas...</p>
      </main>
    );
  }

  return (
    <main className="ag-page">
      <header className="ag-encabezado">
        <div>
          <p className="ag-eyebrow">Tu agenda</p>
          <h1>Mis citas</h1>
          <p className="ag-subtitulo">
            Consulta el estado de tus solicitudes y reprograma cuando lo necesites.
          </p>
        </div>
        <button
          type="button"
          className="ag-btn ag-btn--ghost"
          onClick={cargarCitas}
          disabled={cargando}
        >
          <FiRefreshCw size={15} className={cargando ? "ag-girar-sin-fin" : ""} />
          Actualizar
        </button>
      </header>

      {error && (
        <div className="ag-alerta ag-alerta--error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={cargarCitas}>
            Reintentar
          </button>
        </div>
      )}
      {mensaje && (
        <div className="ag-alerta ag-alerta--exito" role="status">
          {mensaje}
        </div>
      )}

      <MetricasCitas items={metricas} />

      <div className="ag-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.clave}
            type="button"
            role="tab"
            aria-selected={tab === t.clave}
            className={`ag-tab ${tab === t.clave ? "activo" : ""}`}
            onClick={() => setTab(t.clave)}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <div className="ag-vacio">
          <FiCalendar size={44} />
          <h2>
            {citas.length === 0
              ? "Aún no tienes citas"
              : "No hay citas en esta categoría"}
          </h2>
          <p>
            {citas.length === 0
              ? "Cuando reserves un servicio, aparecerá aquí con su estado."
              : "Prueba con otro filtro para ver el resto de tus citas."}
          </p>
          {citas.length === 0 && (
            <button
              className="ag-btn ag-btn--primario"
              onClick={() => navigate("/")}
            >
              Explorar servicios
            </button>
          )}
        </div>
      ) : (
        <section className="ag-lista">
          {visibles.map((cita) => (
            <CitaCard
              key={cita.id_cita}
              cita={cita}
              onCambiar={setCitaCambio}
              onCancelar={(c) => {
                setErrorCancelar("");
                setCitaCancelar(c);
              }}
            />
          ))}
        </section>
      )}

      {citaCambio && (
        <ModalCambioHorario
          cita={citaCambio}
          onCerrar={() => setCitaCambio(null)}
          onEnviado={async (texto) => {
            setCitaCambio(null);
            setMensaje(texto ?? "Propuesta enviada.");
            await cargarCitas();
          }}
        />
      )}

      {citaCancelar && (
        <ModalAccion
          titulo="¿Cancelar esta cita?"
          descripcion={`${citaCancelar.servicio?.nombre_producto} · ${formatearFechaHora(citaCancelar.fecha_inicio)}. Esta acción no se puede deshacer.`}
          etiquetaCampo="Motivo de la cancelación"
          placeholder="Cuéntale a la emprendedora por qué cancelas"
          confirmarTexto="Sí, cancelar cita"
          cancelarTexto="Mantener cita"
          tono="peligro"
          cargando={cancelando}
          error={errorCancelar}
          onConfirmar={confirmarCancelacion}
          onCerrar={() => setCitaCancelar(null)}
        />
      )}
    </main>
  );
}
