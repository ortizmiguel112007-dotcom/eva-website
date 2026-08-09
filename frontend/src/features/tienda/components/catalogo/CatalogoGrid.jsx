// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import {
    FiEye,
    FiShoppingCart,
    FiPackage
} from "@/infrastructure/icons/index.js";

import { formatPrecio } from "@/features/tienda/utils/utils";
import { ProductCard } from "@/shared/product/ProductCard";


export function CatalogoGrid({
    navigate,
    filtros,
    filtrados,
    catalogo
}) {
    const POR_PAGINA = 9;
    const visible = filtrados.slice(0, filtros.pagina * POR_PAGINA);
    const hayMas = visible.length < filtrados.length;

    return catalogo.cargando ? (
        <div className="cat-loading">
            <div className="cat-spinner" />
            <p>Cargando productos...</p>
        </div>
    ) : filtrados.length === 0 ? (
        <div className="cat-empty">
            <FiPackage size={48} color="#cbd5e1" />
            <h3>Sin resultados</h3>
            <p>Intenta con otros filtros</p>
        </div>
    ) : (
        <>
            <div className="cat-grid">
                {visible.map((product) => (
                    <ProductCard
                        producto={product}
                        key={product.id_producto}
                        onClick={() => navigate(`/producto-detalle/${product.id_producto}`)}
                    />
                ))}
            </div >

            {hayMas && (
                <div className="cat-cargar-mas-wrap">
                    <button
                        className="cat-btn-cargar-mas"
                        onClick={() => filtros.setPagina((p) => p + 1)}
                    >
                        Cargar más productos
                    </button>
                </div>
            )
            }
        </>
    )
}