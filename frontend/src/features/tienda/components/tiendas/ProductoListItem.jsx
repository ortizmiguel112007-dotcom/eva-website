// tienda/components/tiendas/ProductoListItem.jsx
import {
  FiPackage,
  FiClock,
  FiHeart,
  FiShoppingCart,
  FiCheck,
} from "react-icons/fi";
import { formatPrecio } from "@/features/tienda/utils/utils";

import "@/infrastructure/css/tienda/tiendas-perfil/ProductoListItem.css";

export function ProductoListItem({ p, onNavigate, acciones, puedeComprar }) {
  const esFav = acciones.esFavorito(p.id_producto);
  const yaAgregado = acciones.yaAgregado(p.id_producto);

  return (
    <div className="pt-list-item">
      <div className="pt-list-img" onClick={() => onNavigate(p.id_producto)}>
        {p.imagen ? (
          <img src={p.imagen} alt={p.nombre_producto} />
        ) : (
          <div className="pt-list-no-img">
            <FiPackage size={24} color="#cbd5e1" />
          </div>
        )}
      </div>
      <div className="pt-list-info">
        <div className="pt-list-top">
          <span className={`pt-badge pt-badge--${p.tipo}`}>{p.tipo}</span>
          <span className="pt-list-cat">{p.categoria}</span>
        </div>
        <h3 className="pt-list-nombre">{p.nombre_producto}</h3>
        {p.descripcion && <p className="pt-list-desc">{p.descripcion}</p>}
        {p.tipo === "servicio" && p.duracion && (
          <div className="pt-card-duracion">
            <FiClock size={11} /> {p.duracion}
          </div>
        )}
      </div>
      <div className="pt-list-acciones">
        <span className="pt-list-precio">{formatPrecio(p.precio)}</span>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {puedeComprar && (
            <button
              className={`pt-fav-btn ${esFav ? "active" : ""}`}
              onClick={(e) => acciones.toggleFav(e, p.id_producto)}
            >
              <FiHeart
                size={13}
                fill={esFav ? "#ef4444" : "none"}
                color={esFav ? "#ef4444" : "#94a3b8"}
              />
            </button>
          )}
          {puedeComprar ? (
            <button
              className={`pt-btn-agregar ${yaAgregado ? "agregado" : ""}`}
              onClick={(e) => acciones.handleAgregar(e, p)}
            >
              {yaAgregado ? (
                <>
                  <FiCheck size={13} /> Listo
                </>
              ) : (
                <>
                  <FiShoppingCart size={13} /> Agregar
                </>
              )}
            </button>
          ) : (
            <button
              className="pt-btn-agregar"
              style={{ opacity: 0.5, cursor: "not-allowed" }}
              onClick={(e) => e.stopPropagation()}
            >
              Solo vista
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
