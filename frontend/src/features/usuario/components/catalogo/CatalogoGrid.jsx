import { FiSearch } from "react-icons/fi";
// import { ProductCard } from "./ProductCard";
import { ProductCard } from "@/shared/product/ProductCard"
import "@/infrastructure/css/usuario/catalogo/ProductCard.css"
import "@/infrastructure/css/usuario/catalogo/CatalogoGrid.css"

export function CatalogoGrid({ filtrados, visible, filtros, catalogo, navigate, agregados, onAgregar, favoritos }) {
  if (catalogo.cargando) {
    return (
      <div className="cu-loading">
        <div className="cu-spinner" />
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (filtrados.length === 0) {
    const hayFiltros = filtros.cats.length > 0 || filtros.tipoActivo || filtros.rangoMax < catalogo.precioMax;
    return (
      <div className="cu-empty">
        <FiSearch size={48} color="#cbd5e1" />
        <h3>Sin resultados</h3>
        <p>Intenta con otros filtros o busca algo diferente</p>
        {hayFiltros && (
          <button className="cu-btn-limpiar-grande" onClick={() => {
            filtros.clearCats();
            filtros.setTipoActivo("");
            filtros.setRangoMax(catalogo.precioMax);
            filtros.setPagina(1);
          }}>
            Limpiar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="cu-grid">
        {visible.map((p, idx) => (
          <ProductCard
            key={p.id_producto}
            producto={p}
            idx={idx}
            onNavigate={(id) => navigate(`/producto/${id}`)}
            onAgregar={onAgregar}
            onFavorito={favoritos.toggleFavorito}
            esFavorito={favoritos.esFavorito(p.id_producto)}
            yaAgregado={agregados[p.id_producto]}
          />
        ))}
      </div>
      {visible.length < filtrados.length && (
        <div className="cu-cargar-mas-wrap">
          <button
            className="cu-btn-cargar-mas"
            onClick={() => filtros.setPagina((p) => p + 1)}
          >
            Cargar más productos
          </button>
        </div>
      )}
    </>
  );
}