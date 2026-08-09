//card reutilizable entre PerfilTienda y TiendaAlianza
import {
  FiPackage, FiHeart, FiShoppingCart,
  FiCheck, FiClock, FiEye,
} from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"

import "@/infrastructure/css/tienda/tiendas-perfil/ProductCardGrid.css"

export function ProductCardGrid({ p, onNavigate, acciones, puedeComprar = true }) {
  const agotado    = p.tipo !== "servicio" && p.inventario?.cantidad === 0
  const esFav      = acciones.esFavorito(p.id_producto)
  const yaAgregado = acciones.yaAgregado(p.id_producto)

  return (
    <div
      className="pt-card"
      onClick={() => onNavigate(p.id_producto)}
    >
      {/* Imagen */}
      <div className="pt-card-img">
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre_producto} />
          : <div className="pt-card-no-img"><FiPackage size={36} color="#cbd5e1" /></div>
        }
        <div className="cu-card-img-overlay">
          <span className="cu-card-ver-btn"><FiEye size={16} /> Ver detalle</span>
        </div>
        <span className={`pt-badge pt-badge--${p.tipo}`}>
          {p.tipo === "producto" ? "Producto" : "Servicio"}
        </span>
        <button
          className={`pt-fav-btn ${esFav ? "active" : ""}`}
          onClick={e => acciones.toggleFav(e, p.id_producto)}
        >
          <FiHeart
            size={13}
            fill={esFav ? "#ef4444" : "none"}
            color={esFav ? "#ef4444" : "#94a3b8"}
          />
        </button>
        {agotado && <div className="cu-agotado-overlay"><span>Agotado</span></div>}
      </div>

      {/* Body */}
      <div className="pt-card-body">
        <span className="pt-card-cat">{p.categoria}</span>
        <h3 className="pt-card-nombre">{p.nombre_producto}</h3>
        {p.descripcion && <p className="pt-card-desc">{p.descripcion}</p>}
        {p.tipo === "servicio" && p.duracion && (
          <div className="pt-card-duracion"><FiClock size={11} /> {p.duracion}</div>
        )}
        <div className="pt-card-footer">
          <span className="pt-card-precio">{formatPrecio(p.precio)}</span>
          {puedeComprar ? (
            <button
              className={`pt-btn-agregar ${yaAgregado ? "agregado" : ""} ${agotado ? "agotado" : ""}`}
              disabled={agotado}
              onClick={e => acciones.handleAgregar(e, p)}
            >
              {yaAgregado
                ? <><FiCheck size={13} /> Listo</>
                : agotado ? "Agotado"
                : p.tipo === "servicio" ? "Reservar"
                : <><FiShoppingCart size={13} /> Agregar</>
              }
            </button>
          ) : (
            <button
              className="pt-btn-agregar"
              style={{ opacity: 0.5, cursor: "not-allowed" }}
              onClick={e => { e.stopPropagation(); onNavigate(p.id_producto) }}
            >
              <FiEye size={13} /> Ver
            </button>
          )}
        </div>
      </div>
    </div>
  )
}