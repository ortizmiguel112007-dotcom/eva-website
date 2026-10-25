import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiUser,
} from "react-icons/fi";
import { agendaService } from "../services/agenda.service";
import { tiendaService } from "@/features/tienda/services/tienda.service";
import SelectorHorarios from "../components/SelectorHorarios";
import { ICONO_MODALIDAD } from "../components/ModalidadTag";
import {
  DESCRIPCION_MODALIDAD,
  ETIQUETA_MODALIDAD,
  formatearDuracion,
  formatearFechaHora,
  formatearPrecio,
  obtenerError,
} from "../utils/agenda.utils";
import "@/infrastructure/css/agenda/Agenda.css";

const ORDEN_MODALIDADES = ["virtual", "presencial", "domicilio"];

export default function ReservarCita() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [franjas, setFranjas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [modalidad, setModalidad] = useState("");
  const [horario, setHorario] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        setCargando(true);
        setErrorCarga("");

        const datos = await tiendaService.getProducto(id);
        if (!activo) return;

        if (datos.tipo !== "servicio") {
          setErrorCarga("Este artículo no es un servicio reservable.");
          return;
        }
        setProducto(datos);

        const idEmprendedora =
          datos.seccion?.id_emprendedora ??
          datos.seccion?.emprendedora?.id_emprendedora;

        if (!idEmprendedora) {
          setErrorCarga("No encontramos la emprendedora de este servicio.");
          return;
        }

        const lista = await agendaService.obtenerDisponibilidadPublica(
          idEmprendedora,
        );
        if (!activo) return;
        setFranjas(Array.isArray(lista) ? lista : []);
      } catch (err) {
        if (activo) {
          setErrorCarga(
            obtenerError(err, "No fue posible cargar el servicio."),
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [id]);

  const modalidadesDisponibles = useMemo(
    () =>
      ORDEN_MODALIDADES.filter((m) => franjas.some((f) => f.modalidad === m)),
    [franjas],
  );

  // Preselecciona la primera modalidad que ofrezca la emprendedora.
  useEffect(() => {
    if (!modalidad && modalidadesDisponibles.length > 0) {
      setModalidad(modalidadesDisponibles[0]);
    }
  }, [modalidad, modalidadesDisponibles]);

  const diasHabilitados = useMemo(
    () =>
      new Set(
        franjas.filter((f) => f.modalidad === modalidad).map((f) => f.dia_semana),
      ),
    [franjas, modalidad],
  );

  const lugarFinal =
    modalidad === "presencial"
      ? horario?.lugar
      : modalidad === "domicilio"
        ? direccion.trim()
        : null;

  async function enviarSolicitud(e) {
    e.preventDefault();
    setError("");

    if (!localStorage.getItem("token")) {
      setError("Inicia sesión para solicitar una cita.");
      return;
    }
    if (!horario) {
      setError("Selecciona un día y una hora disponibles.");
      return;
    }
    if (modalidad === "domicilio" && !direccion.trim()) {
      setError("Indica la dirección donde se prestará el servicio.");
      return;
    }

    try {
      setEnviando(true);
      await agendaService.crearCita({
        id_producto: Number(id),
        fecha_inicio: horario.inicio,
        modalidad,
        ...(modalidad === "domicilio" ? { lugar: direccion.trim() } : {}),
        observaciones: observaciones.trim(),
      });
      setExito(true);
    } catch (err) {
      setError(
        obtenerError(
          err,
          "No fue posible enviar la solicitud. Intenta con otro horario.",
        ),
      );
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <main className="ag-page">
        <p className="ag-cargando">Cargando servicio...</p>
      </main>
    );
  }

  if (errorCarga) {
    return (
      <main className="ag-page">
        <div className="ag-vacio">
          <FiCalendar size={44} />
          <h2>No pudimos abrir la reserva</h2>
          <p>{errorCarga}</p>
          <button className="ag-btn ag-btn--primario" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </main>
    );
  }

  if (exito) {
    return (
      <main className="ag-page ag-page--angosta">
        <div className="ag-vacio ag-vacio--exito">
          <FiCheckCircle size={52} />
          <h2>¡Solicitud enviada!</h2>
          <p>
            Te avisaremos cuando la emprendedora responda tu solicitud para{" "}
            <strong>{formatearFechaHora(horario.inicio)}</strong>.
          </p>
          <div className="ag-botones ag-botones--centro">
            <button
              className="ag-btn ag-btn--primario"
              onClick={() => navigate("/mis-citas")}
            >
              Ver mis citas
            </button>
            <button className="ag-btn ag-btn--ghost" onClick={() => navigate("/")}>
              Seguir explorando
            </button>
          </div>
        </div>
      </main>
    );
  }

  const nombreEmprendedora = producto?.seccion?.emprendedora?.usuario?.nombre;

  return (
    <main className="ag-page">
      <button type="button" className="ag-volver" onClick={() => navigate(-1)}>
        <FiArrowLeft size={15} /> Volver
      </button>

      <header className="ag-encabezado">
        <div>
          <p className="ag-eyebrow">Reservar servicio</p>
          <h1>Agenda tu cita</h1>
          <p className="ag-subtitulo">
            Elige modalidad, día y hora. La emprendedora confirmará tu solicitud.
          </p>
        </div>
      </header>

      {modalidadesDisponibles.length === 0 ? (
        <div className="ag-vacio">
          <FiClock size={44} />
          <h2>Aún no hay horarios publicados</h2>
          <p>
            {nombreEmprendedora ?? "La emprendedora"} todavía no ha habilitado
            horarios de atención para este servicio. Vuelve a intentarlo más tarde.
          </p>
        </div>
      ) : (
        <form className="ag-reserva" onSubmit={enviarSolicitud}>
          <div className="ag-reserva-principal">
            <section className="ag-card">
              <h2 className="ag-card-titulo">
                <span className="ag-paso">1</span> Modalidad de atención
              </h2>
              <div className="ag-modalidades">
                {modalidadesDisponibles.map((m) => {
                  const Icono = ICONO_MODALIDAD[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`ag-modalidad ${modalidad === m ? "activo" : ""}`}
                      onClick={() => setModalidad(m)}
                    >
                      <Icono size={20} />
                      <strong>{ETIQUETA_MODALIDAD[m]}</strong>
                      <small>{DESCRIPCION_MODALIDAD[m]}</small>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="ag-card">
              <h2 className="ag-card-titulo">
                <span className="ag-paso">2</span> Día y hora
              </h2>
              <SelectorHorarios
                idProducto={Number(id)}
                modalidad={modalidad}
                diasHabilitados={diasHabilitados}
                valor={horario}
                onChange={setHorario}
              />
            </section>

            <section className="ag-card">
              <h2 className="ag-card-titulo">
                <span className="ag-paso">3</span> Detalles
              </h2>

              {modalidad === "presencial" && (
                <div className="ag-info-lugar">
                  <FiMapPin size={16} />
                  <div>
                    <strong>Lugar de atención</strong>
                    <p>
                      {horario?.lugar ??
                        "Se mostrará al elegir un horario."}
                    </p>
                  </div>
                </div>
              )}

              {modalidad === "domicilio" && (
                <label className="ag-campo">
                  <span>Dirección del servicio</span>
                  <input
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Barrio, calle, número y referencias"
                    maxLength={200}
                  />
                </label>
              )}

              <label className="ag-campo">
                <span>
                  Observaciones <em>(opcional)</em>
                </span>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Cuéntale algo que deba saber antes de la cita"
                />
              </label>
            </section>
          </div>

          <aside className="ag-resumen">
            <div className="ag-card ag-resumen-card">
              {producto?.imagen && (
                <img
                  className="ag-resumen-img"
                  src={producto.imagen}
                  alt={producto.nombre_producto}
                />
              )}
              <h3>{producto?.nombre_producto}</h3>
              {nombreEmprendedora && (
                <p className="ag-resumen-por">
                  <FiUser size={13} /> {nombreEmprendedora}
                </p>
              )}

              <dl className="ag-resumen-lista">
                <div>
                  <dt>Precio</dt>
                  <dd>{formatearPrecio(producto?.precio)}</dd>
                </div>
                <div>
                  <dt>Duración</dt>
                  <dd>{formatearDuracion(producto?.duracion)}</dd>
                </div>
                <div>
                  <dt>Modalidad</dt>
                  <dd>{ETIQUETA_MODALIDAD[modalidad]}</dd>
                </div>
                <div>
                  <dt>Fecha</dt>
                  <dd>
                    {horario ? formatearFechaHora(horario.inicio) : "Sin elegir"}
                  </dd>
                </div>
                {lugarFinal && (
                  <div>
                    <dt>Lugar</dt>
                    <dd>{lugarFinal}</dd>
                  </div>
                )}
              </dl>

              {error && (
                <div className="ag-alerta ag-alerta--error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="ag-btn ag-btn--primario ag-btn--bloque"
                disabled={enviando || !horario}
              >
                {enviando ? "Enviando solicitud..." : "Solicitar cita"}
              </button>
              <p className="ag-nota">
                No se cobra nada ahora. La cita queda pendiente hasta que la
                emprendedora la confirme.
              </p>
            </div>
          </aside>
        </form>
      )}
    </main>
  );
}
