import { FiPackage, FiHeart, FiClock, FiTag } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import { BtnAgregar } from "@/features/tienda/components/shared/BtnAgregar"


import "@/infrastructure/css/usuario/favoritos/FavoritoCard.css"


export function FavoritoCard({ producto: p, idx, onNavigate, onEliminar, onAgregar, yaAgregado }) {
  const agotado      = p.tipo !== "servicio" && p.inventario?.cantidad === 0
  const emprendedora = p.seccion?.emprendedora?.usuario?.nombre || "EVA"

  return (
    <div className="fav-card"
      style={{ animationDelay: `${idx * 0.05}s` }}
      onClick={() => onNavigate(p.id_producto)}
    >
      <div className="fav-card-img">
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre_producto} />
          : <div className="fav-no-img"><FiPackage size={36} color="#cbd5e1" /></div>
        }
        <span className={`fav-tipo-badge fav-tipo--${p.tipo}`}>{p.tipo}</span>
        <button className="fav-btn-eliminar"
          onClick={e => { e.stopPropagation(); onEliminar(p.id_producto) }}
          title="Quitar de favoritos"
        >
          <FiHeart size={14} fill="#ef4444" color="#ef4444" />
        </button>
        {agotado && <div className="fav-agotado-overlay"><span>Agotado</span></div>}
      </div>

      <div className="fav-card-body">
        <span className="fav-cat">{p.categoria}</span>
        <h3 className="fav-nombre">{p.nombre_producto}</h3>
        {p.tipo === "servicio" && p.duracion && (
          <div className="fav-duracion"><FiClock size={11} /> {p.duracion}</div>
        )}
        <span className="fav-tienda"><FiTag size={11} /> {emprendedora}</span>
        <div className="fav-footer">
          <strong className="fav-precio">{formatPrecio(p.precio)}</strong>
          <BtnAgregar
            agregado={yaAgregado}
            agotado={agotado}
            tipo={p.tipo}
            className="fav-btn-agregar"
            onClick={e => { e.stopPropagation(); onAgregar(e, p) }}
          />
        </div>
      </div>
    </div>
  )
}