import { FiPackage, FiStar } from "react-icons/fi"
import { formatPrecio } from "@/features/admin/utils/utils"

import "@/infrastructure/css/admin/destacados/DestacadoAdminCard.css"

export function DestacadoAdminCard({ producto: p, onToggle }) {
  return (
    <div className={`ad-card ${p.destacado ? "destacado" : ""}`}>
      <div className="ad-card-img">
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre_producto} />
          : <div className="ad-card-placeholder"><FiPackage size={36} color="#cbd5e1" /></div>
        }
        {p.destacado && <span className="ad-badge-destacado">⭐ Destacado</span>}
      </div>

      <div className="ad-card-body">
        <h3>{p.nombre_producto}</h3>
        <p className="ad-card-meta">
          {p.seccion?.emprendedora?.usuario?.nombre || "EVA"} · {p.categoria}
        </p>
        <div className="ad-card-footer">
          <span className="ad-precio">{formatPrecio(p.precio)}</span>
          <button
            className={`ad-btn-destacar ${p.destacado ? "activo" : ""}`}
            onClick={() => onToggle(p.id_producto, p.destacado)}
          >
            <FiStar size={13}
              fill={p.destacado ? "#f59e0b" : "none"}
              color={p.destacado ? "#f59e0b" : "#374151"}
            />
            {p.destacado ? "Quitar" : "Destacar"}
          </button>
        </div>
      </div>
    </div>
  )
}