import { ETIQUETA_ESTADO } from "../utils/agenda.utils";

export default function EstadoBadge({ estado }) {
  const clave = String(estado ?? "").toLowerCase();
  return (
    <span className={`ag-badge ag-badge--${clave}`}>
      {ETIQUETA_ESTADO[estado] ?? estado}
    </span>
  );
}