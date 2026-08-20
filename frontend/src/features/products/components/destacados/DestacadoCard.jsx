import { FiStar, FiClock, FiCheck, FiX, FiTrash2, FiClipboard, FiPackage } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/products-emprend/destacados/DestacadoCard.css"

const CATEGORIA_LABEL = {
  nuevos: "Nuevo",
  mas_vendidos: "Más vendido",
  en_oferta: "En oferta",
}

export function DestacadoCard({
  producto,
  contexto = "emprendedora", // "emprendedora" | "admin"
  onSolicitar,
  onAprobar,
  onRechazar,
  onDesactivar,
  onVerHistorial,
}) {
  const estado = producto.destacado
    ? "destacado"
    : producto.solicitud_pendiente
    ? "pendiente"
    : "ninguno"

  return (
    <div className="dc-card">
      <div className="dc-card-img">
        {producto.imagen
          ? <img src={producto.imagen} alt={producto.nombre_producto} />
          : <div className="dc-card-img-placeholder"><FiPackage size={22} color="#cbd5e1" /></div>}
      </div>

      <div className="dc-card-info">
        <div className="dc-card-titulo-row">
          <strong>{producto.nombre_producto}</strong>
          {estado === "destacado" && <span className="dc-badge dc-badge--destacado"><FiStar size={11} /> Destacado</span>}
          {estado === "pendiente" && <span className="dc-badge dc-badge--pendiente"><FiClock size={11} /> Pendiente</span>}
        </div>

        <div className="dc-card-meta">
          <span>{formatPrecio(producto.precio)}</span>
          <span>· Stock: {producto.inventario?.cantidad ?? 0}</span>
          {producto.categoria_destacado && (
            <span className="dc-categoria-tag">{CATEGORIA_LABEL[producto.categoria_destacado] || producto.categoria_destacado}</span>
          )}
        </div>

        {contexto === "admin" && producto.seccion?.emprendedora?.usuario?.nombre && (
          <div className="dc-card-emprendedora">Tienda: {producto.seccion.emprendedora.usuario.nombre}</div>
        )}
      </div>

      <div className="dc-card-acciones">
        {contexto === "emprendedora" && estado === "ninguno" && (
          <button className="dc-btn dc-btn--solicitar" onClick={() => onSolicitar(producto)}>
            <FiStar size={13} /> Solicitar destacado
          </button>
        )}
        {contexto === "emprendedora" && estado === "pendiente" && (
          <span className="dc-hint">Esperando aprobación del admin</span>
        )}
        {contexto === "emprendedora" && estado === "destacado" && (
          <span className="dc-hint dc-hint--ok"><FiCheck size={13} /> Visible en el catálogo</span>
        )}

        {contexto === "admin" && estado === "pendiente" && (
          <>
            <button className="dc-btn dc-btn--aprobar" onClick={() => onAprobar(producto)}>
              <FiCheck size={13} /> Aprobar
            </button>
            <button className="dc-btn dc-btn--rechazar" onClick={() => onRechazar(producto)}>
              <FiX size={13} /> Rechazar
            </button>
          </>
        )}
        {contexto === "admin" && estado === "destacado" && (
          <button className="dc-btn dc-btn--rechazar" onClick={() => onDesactivar(producto)}>
            <FiTrash2 size={13} /> Desactivar
          </button>
        )}
        {contexto === "admin" && (
          <button className="dc-btn dc-btn--historial" onClick={() => onVerHistorial(producto)}>
            <FiClipboard size={13} /> Historial
          </button>
        )}
      </div>
    </div>
  )
}