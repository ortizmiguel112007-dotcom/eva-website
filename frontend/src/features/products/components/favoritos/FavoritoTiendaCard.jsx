import { FiHeart, FiPackage } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import { RatingEstrellas } from "@/features/tienda/components/shared/RatingEstrellas"
import "@/infrastructure/css/products-emprend/favoritos_tiendas/FavoritoTiendaCard.css"

export function FavoritoTiendaCard({ producto: p, idx, onNavigate }) {
  const agotado  = p.tipo !== "servicio" && p.inventario?.cantidad === 0
  const promedio = p.comentarios?.length
    ? p.comentarios.reduce((acc, c) => acc + c.calificacion, 0) / p.comentarios.length
    : null

  return (
    <div className="ft-card"
      style={{ animationDelay: `${idx * 0.05}s` }}
      onClick={() => onNavigate(p.id_seccion)}
    >
      <div className="ft-fav-badge">
        <FiHeart size={11} fill="#ef4444" color="#ef4444" />
        {p.total_favoritos}
      </div>

      <div className="ft-card-img">
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre_producto} />
          : <div className="ft-no-img"><FiPackage size={32} color="#cbd5e1" /></div>
        }
        <span className={`ft-tipo ft-tipo--${p.tipo}`}>{p.tipo}</span>
        {agotado && <div className="ft-agotado">Agotado</div>}
      </div>

      <div className="ft-card-body">
        <span className="ft-cat">{p.categoria}</span>
        <h3 className="ft-nombre">{p.nombre_producto}</h3>

        {promedio && (
          <RatingEstrellas promedio={promedio} size={11} />
        )}

        <div className="ft-card-footer">
          <strong className="ft-precio">{formatPrecio(p.precio)}</strong>
          <div className="ft-stock" style={{
            color: agotado ? "#ef4444"
              : p.inventario?.cantidad <= (p.inventario?.stock_minimo || 0) ? "#f59e0b"
              : "#16a34a"
          }}>
            {agotado ? "Sin stock" : `${p.inventario?.cantidad ?? 0} uds`}
          </div>
        </div>
      </div>
    </div>
  )
}