import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { agendaService } from "../services/agenda.service";
import EstadoBadge from "../components/EstadoBadge";
import MetricasCitas from "../components/MetricasCitas";
import ModalAccion from "../components/ModalAccion";
import ModalidadTag from "../components/ModalidadTag";
import HistorialCambios from "../components/HistorialCambios";
import {
  ETIQUETA_MODALIDAD,
  esFutura,
  esHistorial,
  formatearDuracion,
  formatearFechaHora,
  formatearPrecio,
  formatearRangoHora,
  iniciales,
  obtenerError,
  partesFecha,
  tieneCambioPendiente,
} from "../utils/agenda.utils";
import "@/infrastructure/css/agenda/Agenda.css";

const TABS = [
  { clave: "responder", etiqueta: "Por responder" },
  { clave: "proximas", etiqueta: "Próximas" },
  { clave: "historial", etiqueta: "Historial" },
  { clave: "todas", etiqueta: "Todas" },
];

const FILTROS = {
  responder: (c) =>
    c.estado === "PENDIENTE" ||
    (c.estado === "CONFIRMADA" && tieneCambioPendiente(c)),
  proximas: (c) => c.estado === "CONFIRMADA" && esFutura(c.fecha_fin),
  historial: esHistorial,
  todas: () => true,
};

/* ── Tarjeta de solicitud ────────────────────────────────────── */
function SolicitudCard({ cita, ocupada, onResponder, onResponderCambio, onCancelar }) {
  const [verHistorial, setVerHistorial] = useState(false);
  const { dia, mes, diaSemana } = partesFecha(cita.fecha_inicio);
  const cambios = Array.isArray(cita.cambios) ? cita.cambios : [];
  const cambioPendiente = cambios.find((c) => c.estado === "PENDIENTE");
  const historial = cambios.filter((c) => c.estado !== "PENDIENTE");
  const cliente = cita.cliente;
  const futura = esFutura(cita.fecha_inicio);

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
            <p className="ag-cita-sub">
              {formatearFechaHora(cita.fecha_inicio)}
            </p>
          </div>
          <EstadoBadge estado={cita.estado} />
        </div>

        {cliente && (
          <div className="ag-cliente">
            <span className="ag-avatar">{iniciales(cliente.nombre)}</span>
            <div>
              <strong>{cliente.nombre}</strong>
              <div className="ag-cliente-contacto">
                {cliente.email && (
                  <a href={`mailto:${cliente.email}`}>
                    <FiMail size={12} /> {cliente.email}
                  </a>
                )}
                {cliente.telefono && (
                  <a href={`tel:${cliente.telefono}`}>
                    <FiPhone size={12} /> {cliente.telefono}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

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
            <strong>Observaciones del cliente:</strong> {cita.observaciones}
          </p>
        )}

        {cita.motivo_rechazo && ["RECHAZADA", "CANCELADA"].includes(cita.estado) && (
          <p className="ag-aviso ag-aviso--rojo">
            <strong>Motivo:</strong> {cita.motivo_rechazo}
          </p>
        )}

        {/* Solicitud nueva */}
        {cita.estado === "PENDIENTE" && (
          <div className="ag-cita-acciones">
            <button
              type="button"
              className="ag-btn ag-btn--primario ag-btn--sm"
              disabled={ocupada || !futura}
              onClick={() => onResponder(cita, "CONFIRMADA")}
            >
              <FiCheck size={14} /> Confirmar cita
            </button>
            <button
              type="button"
              className="ag-btn ag-btn--peligro-suave ag-btn--sm"
              disabled={ocupada}
              onClick={() => onResponder(cita, "RECHAZADA")}
            >
              <FiX size={14} /> Rechazar
            </button>
            {!futura && (
              <span className="ag-muted ag-sm">
                La fecha de esta solicitud ya pasó.
              </span>
            )}
          </div>
        )}

        {/* Propuesta de cambio pendiente (RF-109) */}
        {cambioPendiente && cita.estado === "CONFIRMADA" && (
          <div className="ag-propuesta">
            <div className="ag-propuesta-top">
              <FiRefreshCw size={15} />
              <strong>
                {cambioPendiente.proponente?.nombre ?? "El cliente"} propone
                cambiar la cita
              </strong>
            </div>

            <div className="ag-propuesta-cambio">
              <div>
                <small>Actual</small>
                <span>{formatearFechaHora(cita.fecha_inicio)}</span>
                <em>{ETIQUETA_MODALIDAD[cita.modalidad]}</em>
              </div>
              <FiArrowRight size={18} />
              <div className="nuevo">
                <small>Propuesto</small>
                <span>{formatearFechaHora(cambioPendiente.fecha_inicio_propuesta)}</span>
                <em>
                  {ETIQUETA_MODALIDAD[cambioPendiente.modalidad_propuesta]}
                  {cambioPendiente.lugar_propuesto
                    ? ` · ${cambioPendiente.lugar_propuesto}`
                    : ""}
                </em>
              </div>
            </div>

            <div className="ag-cita-acciones">
              <button
                type="button"
                className="ag-btn ag-btn--primario ag-btn--sm"
                disabled={ocupada}
                onClick={() => onResponderCambio(cita, cambioPendiente, "ACEPTADA")}
              >
                <FiCheck size={14} /> Aceptar cambio
              </button>
              <button
                type="button"
                className="ag-btn ag-btn--peligro-suave ag-btn--sm"
                disabled={ocupada}
                onClick={() => onResponderCambio(cita, cambioPendiente, "RECHAZADA")}
              >
                <FiX size={14} /> Rechazar
              </button>
            </div>
          </div>
        )}

        {/* Acciones secundarias */}
        {(cita.estado === "CONFIRMADA" && futura) || historial.length > 0 ? (
          <div className="ag-cita-acciones">
            {cita.estado === "CONFIRMADA" && futura && (
              <button
                type="button"
                className="ag-btn ag-btn--ghost ag-btn--sm"
                disabled={ocupada}
                onClick={() => onCancelar(cita)}
              >
                Cancelar cita
              </button>
            )}
            {historial.length > 0 && (
              <button
                type="button"
                className="ag-btn ag-btn--ghost ag-btn--sm ag-btn--der"
                onClick={() => setVerHistorial((v) => !v)}
                aria-expanded={verHistorial}
              >
                Historial de cambios ({historial.length})
                <FiChevronDown
                  size={14}
                  className={verHistorial ? "ag-girar" : ""}
                />
              </button>
            )}
          </div>
        ) : null}

        {verHistorial && <HistorialCambios cambios={historial} />}
      </div>
    </article>
  );
}

/* ── Página ──────────────────────────────────────────────────── */
export default function GestionCitas() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tab, setTab] = useState("responder");
  const [busqueda, setBusqueda] = useState("");

  // Diálogo activo: { tipo: 'cita'|'cambio'|'cancelar', cita, cambio?, estado? }
  const [dialogo, setDialogo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [errorDialogo, setErrorDialogo] = useState("");

  const cargarCitas = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await agendaService.obtenerCitasRecibidas();
      setCitas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(obtenerError(err, "No fue posible cargar las citas recibidas."));
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

  const contadores = useMemo(() => {
    const por = (clave) => citas.filter(FILTROS[clave]).length;
    return {
      responder: por("responder"),
      proximas: por("proximas"),
      historial: por("historial"),
      todas: citas.length,
    };
  }, [citas]);

  const metricas = useMemo(
    () => [
      {
        etiqueta: "Por responder",
        valor: contadores.responder,
        Icono: FiAlertCircle,
        tono: contadores.responder > 0 ? "ambar" : "neutro",
      },
      {
        etiqueta: "Próximas citas",
        valor: contadores.proximas,
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
      { etiqueta: "Total recibidas", valor: citas.length, Icono: FiCalendar },
    ],
    [citas, contadores],
  );

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = citas
      .filter(FILTROS[tab])
      .filter(
        (c) =>
          !q ||
          c.cliente?.nombre?.toLowerCase().includes(q) ||
          c.servicio?.nombre_producto?.toLowerCase().includes(q),
      );

    return tab === "responder" || tab === "proximas"
      ? [...lista].sort(
          (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
        )
      : lista;
  }, [citas, tab, busqueda]);

  const cerrarDialogo = () => {
    if (procesando) return;
    setDialogo(null);
    setErrorDialogo("");
  };

  const ejecutar = async (texto) => {
    if (!dialogo) return;
    setProcesando(true);
    setErrorDialogo("");

    try {
      let r;
      if (dialogo.tipo === "cita") {
        r = await agendaService.responderCita(
          dialogo.cita.id_cita,
          dialogo.estado,
          texto,
        );
      } else if (dialogo.tipo === "cambio") {
        r = await agendaService.responderCambioCita(
          dialogo.cita.id_cita,
          dialogo.cambio.id_cambio,
          dialogo.estado,
          texto,
        );
      } else {
        r = await agendaService.cancelarCita(dialogo.cita.id_cita, texto);
      }

      setMensaje(r?.message ?? "Acción realizada correctamente.");
      setDialogo(null);
      await cargarCitas();
    } catch (err) {
      setErrorDialogo(obtenerError(err, "No fue posible completar la acción."));
    } finally {
      setProcesando(false);
    }
  };

  const configDialogo = (() => {
    if (!dialogo) return null;
    const servicio = dialogo.cita.servicio?.nombre_producto ?? "el servicio";
    const cliente = dialogo.cita.cliente?.nombre ?? "el cliente";

    if (dialogo.tipo === "cita" && dialogo.estado === "CONFIRMADA") {
      return {
        titulo: "Confirmar cita",
        descripcion: `${cliente} · ${servicio} · ${formatearFechaHora(dialogo.cita.fecha_inicio)}. Le avisaremos de inmediato.`,
        confirmarTexto: "Confirmar cita",
        tono: "primario",
      };
    }
    if (dialogo.tipo === "cita") {
      return {
        titulo: "Rechazar solicitud",
        descripcion: `${cliente} · ${servicio} · ${formatearFechaHora(dialogo.cita.fecha_inicio)}.`,
        etiquetaCampo: "Motivo del rechazo",
        placeholder: "Explícale al cliente por qué no puedes atender ese horario",
        confirmarTexto: "Rechazar solicitud",
        tono: "peligro",
      };
    }
    if (dialogo.tipo === "cambio" && dialogo.estado === "ACEPTADA") {
      return {
        titulo: "Aceptar cambio de horario",
        descripcion: `La cita pasará al ${formatearFechaHora(dialogo.cambio.fecha_inicio_propuesta)}. Volveremos a validar tu disponibilidad.`,
        etiquetaCampo: "Mensaje para el cliente",
        placeholder: "Ej: ¡Perfecto, te espero!",
        confirmarTexto: "Aceptar cambio",
        tono: "primario",
      };
    }
    if (dialogo.tipo === "cambio") {
      return {
        titulo: "Rechazar cambio de horario",
        descripcion: "La cita conservará su horario actual.",
        etiquetaCampo: "Mensaje para el cliente",
        placeholder: "Cuéntale por qué no puedes en ese horario",
        confirmarTexto: "Rechazar cambio",
        tono: "peligro",
      };
    }
    return {
      titulo: "Cancelar cita confirmada",
      descripcion: `${cliente} · ${servicio} · ${formatearFechaHora(dialogo.cita.fecha_inicio)}. Esta acción no se puede deshacer.`,
      etiquetaCampo: "Motivo de la cancelación",
      placeholder: "Avísale al cliente por qué cancelas",
      confirmarTexto: "Sí, cancelar cita",
      cancelarTexto: "Mantener cita",
      tono: "peligro",
    };
  })();

  if (cargando && citas.length === 0) {
    return (
      <main className="ag-page">
        <p className="ag-cargando">Cargando citas recibidas...</p>
      </main>
    );
  }

  return (
    <main className="ag-page">
      <header className="ag-encabezado">
        <div>
          <p className="ag-eyebrow">Panel de emprendedora</p>
          <h1>Gestión de citas</h1>
          <p className="ag-subtitulo">
            Responde las solicitudes de tus clientes y administra tu agenda.
          </p>
        </div>
        <div className="ag-botones">
          <button
            type="button"
            className="ag-btn ag-btn--ghost"
            onClick={cargarCitas}
            disabled={cargando || procesando}
          >
            <FiRefreshCw size={15} className={cargando ? "ag-girar-sin-fin" : ""} />
            Actualizar
          </button>
          <button
            type="button"
            className="ag-btn ag-btn--primario"
            onClick={() => navigate("/disponibilidad")}
          >
            <FiSettings size={15} /> Mi disponibilidad
          </button>
        </div>
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

      <div className="ag-barra">
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
              {contadores[t.clave] > 0 && (
                <span
                  className={`ag-tab-contador ${t.clave === "responder" ? "alerta" : ""}`}
                >
                  {contadores[t.clave]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="ag-busqueda">
          <FiSearch size={15} />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente o servicio"
            aria-label="Buscar cliente o servicio"
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="ag-vacio">
          <FiCalendar size={44} />
          <h2>
            {citas.length === 0
              ? "Aún no has recibido citas"
              : tab === "responder"
                ? "Estás al día"
                : "No hay citas para mostrar"}
          </h2>
          <p>
            {citas.length === 0
              ? "Cuando un cliente reserve uno de tus servicios, la solicitud aparecerá aquí."
              : tab === "responder"
                ? "No tienes solicitudes ni propuestas de cambio pendientes."
                : "Prueba con otro filtro o cambia la búsqueda."}
          </p>
        </div>
      ) : (
        <section className="ag-lista">
          {visibles.map((cita) => (
            <SolicitudCard
              key={cita.id_cita}
              cita={cita}
              ocupada={procesando}
              onResponder={(c, estado) => {
                setErrorDialogo("");
                setDialogo({ tipo: "cita", cita: c, estado });
              }}
              onResponderCambio={(c, cambio, estado) => {
                setErrorDialogo("");
                setDialogo({ tipo: "cambio", cita: c, cambio, estado });
              }}
              onCancelar={(c) => {
                setErrorDialogo("");
                setDialogo({ tipo: "cancelar", cita: c });
              }}
            />
          ))}
        </section>
      )}

      {dialogo && configDialogo && (
        <ModalAccion
          {...configDialogo}
          cargando={procesando}
          error={errorDialogo}
          onConfirmar={ejecutar}
          onCerrar={cerrarDialogo}
        />
      )}
    </main>
  );
}
