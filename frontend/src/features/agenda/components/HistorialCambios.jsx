import { FiArrowRight } from "react-icons/fi";
import EstadoBadge from "./EstadoBadge";
import {
  ETIQUETA_MODALIDAD,
  formatearFechaHora,
} from "../utils/agenda.utils";

/** RF-110: historial de propuestas de cambio de horario y su estado. */
export default function HistorialCambios({ cambios }) {
  if (!Array.isArray(cambios) || cambios.length === 0) return null;

  return (
    <div className="ag-historial">
      <h4>Historial de cambios de horario</h4>

      <ol>
        {cambios.map((cambio) => (
          <li key={cambio.id_cambio} className="ag-historial-item">
            <div className="ag-historial-top">
              <span className="ag-historial-quien">
                {cambio.proponente?.nombre ?? "Cliente"} propuso un cambio
                <small>{formatearFechaHora(cambio.fecha_creacion)}</small>
              </span>
              <EstadoBadge estado={cambio.estado} />
            </div>

            <div className="ag-historial-fechas">
              {cambio.fecha_inicio_original && (
                <>
                  <span className="ag-historial-antes">
                    {formatearFechaHora(cambio.fecha_inicio_original)}
                  </span>
                  <FiArrowRight size={14} />
                </>
              )}
              <strong>{formatearFechaHora(cambio.fecha_inicio_propuesta)}</strong>
            </div>

            <p className="ag-historial-meta">
              {ETIQUETA_MODALIDAD[cambio.modalidad_propuesta] ??
                cambio.modalidad_propuesta}
              {cambio.lugar_propuesto ? ` · ${cambio.lugar_propuesto}` : ""}
            </p>

            {cambio.respuesta && (
              <p className="ag-historial-resp">
                <strong>Respuesta:</strong> {cambio.respuesta}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}