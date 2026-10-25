import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

/**
 * Diálogo de confirmación con campo de texto opcional/obligatorio.
 * Reemplaza window.confirm y alert para mantener el estilo del proyecto.
 */
export default function ModalAccion({
  titulo,
  descripcion,
  etiquetaCampo,
  placeholder,
  requerido = false,
  confirmarTexto = "Confirmar",
  cancelarTexto = "Volver",
  tono = "primario",
  cargando = false,
  error = "",
  onConfirmar,
  onCerrar,
  children,
}) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const alPresionar = (e) => e.key === "Escape" && !cargando && onCerrar();
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [cargando, onCerrar]);

  const puedeEnviar = !cargando && (!requerido || texto.trim().length > 0);

  return (
    <div
      className="ag-overlay"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !cargando && onCerrar()}
    >
      <div className="ag-modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <button
          type="button"
          className="ag-modal-cerrar"
          onClick={onCerrar}
          disabled={cargando}
          aria-label="Cerrar"
        >
          <FiX size={18} />
        </button>

        <h2>{titulo}</h2>
        {descripcion && <p className="ag-modal-desc">{descripcion}</p>}

        {children}

        {etiquetaCampo && (
          <label className="ag-campo">
            <span>
              {etiquetaCampo}
              {!requerido && <em> (opcional)</em>}
            </span>
            <textarea
              rows={3}
              maxLength={1000}
              value={texto}
              placeholder={placeholder}
              onChange={(e) => setTexto(e.target.value)}
              disabled={cargando}
            />
          </label>
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
            disabled={cargando}
          >
            {cancelarTexto}
          </button>
          <button
            type="button"
            className={`ag-btn ag-btn--${tono}`}
            onClick={() => onConfirmar(texto.trim())}
            disabled={!puedeEnviar}
          >
            {cargando ? "Procesando..." : confirmarTexto}
          </button>
        </div>
      </div>
    </div>
  );
}