import { useEffect, useMemo, useState } from "react";
import { FiClock } from "react-icons/fi";
import { agendaService } from "../services/agenda.service";
import { diasProximos, obtenerError } from "../utils/agenda.utils";

/**
 * RF-104: muestra solo días y horas habilitados por la emprendedora.
 *
 * - `diasHabilitados`: Set con los días de la semana (0-6) que tienen franjas
 *   activas para la modalidad elegida.
 * - Los horarios concretos (ya sin los ocupados ni los pasados) vienen del
 *   backend: GET /api/agenda/horarios.
 */
export default function SelectorHorarios({
  idProducto,
  modalidad,
  diasHabilitados,
  valor, // slot seleccionado (objeto) o null
  onChange,
}) {
  const dias = useMemo(() => diasProximos(21), []);
  const [fecha, setFecha] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Si cambia la modalidad o el día elegido deja de estar habilitado, se limpia.
  useEffect(() => {
    const dia = dias.find((d) => d.fecha === fecha);
    if (fecha && dia && !diasHabilitados.has(dia.diaSemana)) {
      setFecha("");
      setHorarios([]);
    }
    onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidad]);

  useEffect(() => {
    if (!fecha || !modalidad) return;
    let activo = true;

    (async () => {
      setCargando(true);
      setError("");
      try {
        const data = await agendaService.obtenerHorariosDisponibles({
          id_producto: idProducto,
          fecha,
          modalidad,
        });
        if (activo) setHorarios(data.horarios ?? []);
      } catch (err) {
        if (activo) {
          setHorarios([]);
          setError(obtenerError(err, "No se pudieron consultar los horarios."));
        }
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [fecha, modalidad, idProducto]);

  const elegirDia = (d) => {
    setFecha(d.fecha);
    onChange(null);
  };

  return (
    <div className="ag-selector">
      <p className="ag-selector-etiqueta">Elige un día</p>
      <div className="ag-dias" role="listbox" aria-label="Días disponibles">
        {dias.map((d) => {
          const habilitado = diasHabilitados.has(d.diaSemana);
          return (
            <button
              key={d.fecha}
              type="button"
              role="option"
              aria-selected={fecha === d.fecha}
              disabled={!habilitado}
              className={`ag-dia ${fecha === d.fecha ? "activo" : ""}`}
              onClick={() => elegirDia(d)}
              title={habilitado ? "" : "Sin atención este día"}
            >
              <small>{d.nombre}</small>
              <strong>{d.numero}</strong>
              <small>{d.mes}</small>
            </button>
          );
        })}
      </div>

      <p className="ag-selector-etiqueta">Elige una hora</p>

      {!fecha ? (
        <p className="ag-selector-aviso">Selecciona primero un día.</p>
      ) : cargando ? (
        <p className="ag-selector-aviso">Buscando horarios...</p>
      ) : error ? (
        <div className="ag-alerta ag-alerta--error" role="alert">
          {error}
        </div>
      ) : horarios.length === 0 ? (
        <p className="ag-selector-aviso">
          No quedan horarios libres este día para esta modalidad. Prueba con otro día.
        </p>
      ) : (
        <div className="ag-horas">
          {horarios.map((h) => (
            <button
              key={h.inicio}
              type="button"
              className={`ag-hora ${valor?.inicio === h.inicio ? "activo" : ""}`}
              onClick={() => onChange(h)}
            >
              <FiClock size={13} />
              {h.hora_inicio}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}