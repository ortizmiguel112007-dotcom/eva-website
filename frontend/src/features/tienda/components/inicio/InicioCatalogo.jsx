/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                        InicioCatalogo                        ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Sección de vista previa del catálogo general en la página de inicio.
 * Muestra una selección limitada de productos (máximo 6) para invitar
 * al usuario a explorar la tienda completa.
 *
 * ──────────────────────────────────────────────────────────────
 * 
 * 🎯 Responsabilidades:
 * - Gestionar visualmente el estado de carga (Loading) del catálogo.
 * - Renderizar un máximo de 6 productos para mantener el rendimiento.
 * - Manejar el estado vacío (Empty State) cuando no hay productos.
 * - Proveer navegación hacia el catálogo completo.
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🔗 Dependencias:
 * - UiButton: CTA para ver el catálogo completo.
 * - UIBase: Utilizado como contenedor para estados de carga y vacío.
 * - ProductCard: Componente para la representación de cada ítem.
 * - infrastructure/icons: Emplea FiPackage y FiArrowRight.
 *
 * ──────────────────────────────────────────────────────────────
 */

// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import {
    FiPackage,
    FiArrowRight
} from "@/infrastructure/icons/index.js";

// ══ Shared ════════════
import { UiButton } from "@/shared/ui/UiButton";
import { UIBase } from "@/shared/ui/UIStat";
import { ProductCard } from "@/shared/product/ProductCard";
import { ProductCategory } from "@/shared/product/ProductCategory";

/**
 * ⚙️ Parámetros (props):
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.navigate - Función para el redireccionamiento.
 * @param {boolean} [props.cargando=true] - Estado de carga de la petición de datos.
 * @param {Array} [props.catalogo=[]] - Lista total de productos disponibles.
 */
export function InicioCatalogo({
    navigate,
    tienda,
}) {
    return (
        <section className="ip-seccion">
            <div className="ip-seccion-header">
                <div>
                    <div className="ip-seccion-tag">
                        <FiPackage size={12} /> Catálogo
                    </div>
                    <h2>Todos los Productos</h2>
                    <p>La creatividad de nuestras emprendedoras</p>
                </div>
                <UiButton
                    className="ip-btn tertiary"
                    onClick={() => navigate("/catalogo")}
                    iconPosition="r"
                    icon={FiArrowRight}>
                    Ver catálogo completo
                </UiButton>
            </div>

            <div>
                <ProductCategory
                    categories={tienda.categories}
                    onClick={tienda.onCategoria}
                    className="ip-cats-grid"
                />
            </div>

            <div>
                {tienda.cargando ? (
                    <UIBase className="ip-loading">
                        <div className="ip-spinner" />
                        <span>Cargando productos...</span>
                    </UIBase>
                ) : (
                    <>
                        <div className="ip-grid-3">
                            {tienda.catalogo.slice(0, 6).map((product) => (
                                <ProductCard key={product.id_producto} product={product} onClick={() => navigate(`/producto-detalle/${product.id_producto}`)} />
                            ))}
                        </div>
                        {tienda.catalogo.length === 0 && (
                            <UIBase className="ip-empty" icon={FiPackage}>
                                <p>No hay productos disponibles</p>
                            </UIBase>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}
/**
 * 🧩 Ejemplo de implementación:
 * 
 * <InicioCatalogo 
 *    navigate={navigate} 
 *    cargando={loadingState} 
 *    catalogo={allProducts} 
 * />
 */