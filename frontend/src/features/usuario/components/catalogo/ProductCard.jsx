// usuario/components/catalogo/ProductCard.jsx
import { FiPackage, FiHeart, FiClock, FiTag, FiEye } from "react-icons/fi";
import { formatPrecio } from "@/features/tienda/utils/utils";
import { BtnAgregar } from "@/features/tienda/components/shared/BtnAgregar";
import { RatingEstrellas } from "@/features/tienda/components/shared/RatingEstrellas";
import "@/infrastructure/css/usuario/catalogo/ProductCard.css";

export function ProductCard({
  producto: p,
  onNavigate,
  onAgregar,
  onFavorito,
  esFavorito,
  yaAgregado,
  idx,
}) {
  const agotado = p.tipo !== "servicio" && p.inventario?.cantidad === 0;

  const calPromedio = p.comentarios?.length
    ? p.comentarios.reduce((acc, c) => acc + c.calificacion, 0) /
      p.comentarios.length
    : 0;

  const nombreTienda = p.seccion?.alianza
    ? p.seccion.alianza.participantes?.map((x) => x.usuario?.nombre).join(" & ")
    : p.seccion?.emprendedora?.usuario?.nombre || "EVA";

  const d = p.descuento;
  const precioFinal = d ? d.precio_con_descuento : Number(p.precio);
  const porcentaje =
    d?.tipo === "porcentaje"
      ? `-${d.valor}%`
      : d
        ? `-${formatPrecio(d.descuento)}`
        : null;

  return (
    <div
      className="cu-card"
      style={{ animationDelay: `${(idx % 9) * 0.04}s` }}
      onClick={() => onNavigate(p.id_producto)}
    >
      <div className="cu-card-img">
        {p.imagen ? (
          <img src={p.imagen} alt={p.nombre_producto} />
        ) : (
          <div className="cu-no-img">
            <FiPackage size={36} color="#cbd5e1" />
          </div>
        )}
        <div className="cu-card-img-overlay">
          <span className="cu-card-ver-btn">
            <FiEye size={16} /> Ver detalle
          </span>
        </div>
        <span className={`cu-badge cu-badge--${p.tipo}`}>{p.tipo}</span>
        <button
          className={`cu-fav-btn ${esFavorito ? "active" : ""}`}
          onClick={(e) => onFavorito(e, p.id_producto)}
        >
          <FiHeart
            size={13}
            fill={esFavorito ? "#ef4444" : "none"}
            color={esFavorito ? "#ef4444" : "#94a3b8"}
          />
        </button>
        {agotado && (
          <div className="cu-agotado-overlay">
            <span>Agotado</span>
          </div>
        )}
      </div>

      <div className="cu-card-body">
        <span className="cu-card-cat">{p.categoria}</span>
        <h3 className="cu-card-nombre">{p.nombre_producto}</h3>

        {/* reutilizado de tienda */}
        <RatingEstrellas
          promedio={calPromedio}
          total={p.comentarios?.length}
          size={11}
        />

        {p.descripcion && <p className="cu-card-desc">{p.descripcion}</p>}
        {p.tipo === "servicio" && p.duracion && (
          <div className="cu-card-duracion">
            <FiClock size={11} /> {p.duracion}
          </div>
        )}
        <span className="cu-card-tienda">
          <FiTag size={11} /> {nombreTienda}
        </span>
        <div className="cu-card-footer">
          <div className="cu-precios">
            {d && (
              <span className="cu-precio-original">
                {formatPrecio(p.precio)}
              </span>
            )}
            <div className="cu-precio-row">
              <span className="cu-card-precio">
                {formatPrecio(precioFinal)}
              </span>
              {porcentaje && (
                <span className="cu-descuento-badge">{porcentaje}</span>
              )}
            </div>
          </div>

          {/* reutilizado de tienda */}
          <BtnAgregar
            agregado={yaAgregado}
            agotado={agotado}
            tipo={p.tipo}
            className="cu-btn-agregar"
            onClick={(e) => {
              e.stopPropagation();
              onAgregar(e, p);
            }}
          />
        </div>
      </div>
    </div>
  );
}
