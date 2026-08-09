import { formatPrecio } from "@/features/tienda/utils/utils"

import "@/infrastructure/css/products-emprend/destacados/DestacadoCard.css"

export function DestacadoCard({ producto: p, onToggle }) {
  return (
    <div className={`destacado-card ${p.destacado ? "es-destacado" : ""}`}>
      <div className="product-card-img-wrapper">
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre_producto} />
          : <div className="img-placeholder">📦</div>
        }
        <span className={`destacado-tipo-badge ${p.tipo}`}>{p.tipo}</span>
        <button
          className={`destacado-star ${p.destacado ? "activo" : "inactivo"}`}
          onClick={() => onToggle(p.id_producto)}
          title={p.destacado ? "Quitar de destacados" : "Destacar"}
        >
          ★
        </button>
      </div>

      <div className="destacado-body">
        <h3 className="destacado-nombre">{p.nombre_producto}</h3>
        <span className="destacado-categoria">{p.categoria || "Sin categoría"}</span>
        <span className="destacado-precio">{formatPrecio(p.precio)}</span>
        {p.destacado && <span className="destacado-label">★ Destacado</span>}
      </div>
    </div>
  )
}