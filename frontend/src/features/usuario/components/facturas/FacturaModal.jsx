
import { useState } from "react";
import { FiX, FiDownload } from "react-icons/fi";
import "@/infrastructure/css/usuario/facturas/FacturaModal.css";

export function FacturaModal({ factura, onCerrar, onDescargar }) {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState("");

  if (!factura) return null;

  const descargarFactura = async () => {
    if (!onDescargar || descargando) return;

    try {
      setDescargando(true);
      setError("");

      await onDescargar(factura);

      onCerrar();
    } catch (err) {
      console.error("Error al descargar la factura:", err);
      setError("No fue posible descargar la factura. Inténtalo nuevamente.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="mf-modal-overlay" onClick={onCerrar}>
      <div className="mf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mf-modal-header">
          <h3>Vista previa — Factura {factura.numero}</h3>

          <button type="button" onClick={onCerrar}>
            <FiX size={16} />
          </button>
        </div>

        {factura.url_pdf ? (
          <iframe
            src={factura.url_pdf}
            title={`Factura ${factura.numero}`}
            className="mf-preview-pdf"
          />
        ) : (
          <div className="mf-preview-error">
            No hay un documento PDF disponible para visualizar.
          </div>
        )}

        {error && (
          <p className="mf-error-descarga">{error}</p>
        )}

        <div className="mf-modal-footer">
          <button
            type="button"
            className="mf-btn-cancelar"
            onClick={onCerrar}
          >
            Cerrar
          </button>

          <button
            type="button"
            className="mf-btn-descargar-modal"
            onClick={descargarFactura}
            disabled={descargando || !factura.url_pdf}
          >
            <FiDownload size={14} />
            {descargando ? "Descargando..." : "Descargar factura"}
          </button>
        </div>
      </div>
    </div>
  );
}
