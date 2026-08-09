import { FiPackage, FiEyeOff } from "react-icons/fi"
import { RatingEstrellas } from "@/features/tienda/components/shared/RatingEstrellas"
import { formatFecha } from "@/features/tienda/utils/utils"

export function ComentarioCard({ resena: r, onOcultar }) {
  return (
    <div className={`ar-card ${!r.activo ? "ar-card--oculto" : ""}`}>
      <div className={`ar-card-stripe ${r.activo ? "activo" : "oculto"}`} />

      <div className="ar-card-header">
        <div className="ar-card-info">
          <div className="ar-card-usuario">
            <div className="ar-avatar">
              {(r.usuario?.nombre || "U")[0].toUpperCase()}
            </div>
            <div>
              <span className="ar-usuario-nombre">{r.usuario?.nombre || "Usuario"}</span>
              <div className="ar-card-meta">
                <span><FiPackage size={11} /> {r.producto_nombre || "Producto"}</span>
                <span>· {formatFecha(r.fecha)}</span>
              </div>
            </div>
          </div>
          <RatingEstrellas promedio={r.calificacion} size={12} />
        </div>

        <div className="ar-card-acciones">
          <span className={`ar-badge ${r.activo ? "activo" : "oculto"}`}>
            {r.activo ? "Activo" : "Oculto"}
          </span>
          {r.activo && (
            <button onClick={() => onOcultar(r.id_comentario)} className="ar-btn-ocultar">
              <FiEyeOff size={13} /> Ocultar
            </button>
          )}
        </div>
      </div>

      <blockquote className="ar-card-texto">"{r.texto}"</blockquote>
    </div>
  )
}