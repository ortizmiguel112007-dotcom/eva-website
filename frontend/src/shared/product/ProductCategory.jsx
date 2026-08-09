/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                     ProductCategory                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Componente reutilizable que renderiza un conjunto de categorías
 * en forma de botones. Permite seleccionar una categoría activa
 * y notificar el cambio mediante un callback.
 *
 * Utiliza internamente el componente `UiButton` para mantener
 * consistencia visual en la UI.
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 📦 Importación:
 * import { ProductCategory } from "@/shared/product/ProductCategory"
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🧩 Ejemplos de uso:
 *
 * const categories = [
 *   { label: "Electrónica", icon: ElectronicaIcon, value: "electronics" },
 *   { label: "Ropa", icon: RopaIcon, value: "clothing" },
 *   { label: "Libros", icon: LibrosIcon, value: "books" }
 * ];
 *
 * [ Uso básico ]
 * <ProductCategory
 *   categories={categories}
 * />
 *
 * [ Con callback ]
 * <ProductCategory
 *   categories={categories}
 *   onClick={(value) => console.log(value)}
 * />
 *
 * [ Cambiando el contenedor raíz ]
 * <ProductCategory
 *   typeContent="section"
 *   categories={categories}
 * />
 *
 * ──────────────────────────────────────────────────────────────
 *
 * ⚙️ Parámetros (props):
 *
 * @param {Object} props - Propiedades del componente
 * @param {React.ElementType} [props.typeContent="div"] - Tipo de contenedor raíz (div, section, article, etc.)
 * @param {Array<Object>} [props.categories=[]] - Lista de categorías a renderizar
 * @param {string} props.categories[].label - Texto visible del botón
 * @param {React.ComponentType} props.categories[].icon - Componente de ícono
 * @param {string} props.categories[].value - Identificador único de la categoría
 * @param {(value: string) => void} [props.onClick] - Callback al seleccionar una categoría
 * @param {Object} [props.rest] - Props adicionales (className, style, id, etc.)
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🔄 Retorno:
 *
 * @returns {React.ReactElement}
 *
 * Devuelve un contenedor dinámico (`typeContent`) que incluye:
 * - Una lista de botones (`UiButton`)
 * - Cada botón representa una categoría
 * - La categoría activa recibe la clase `active`
 *
 * Estructura:
 *
 * <div>
 *   <button class="active">Categoría 1</button>
 *   <button>Categoría 2</button>
 *   <button>Categoría 3</button>
 * </div>
 *
 * ──────────────────────────────────────────────────────────────
 */

// Hooks de React para estado y ciclo de vida
import { useState } from "react";

// ══ Estilos ══════════
import "@/infrastructure/css/shared/product/ProductCategory.css";

// ══ Shared ═══════════
import { UiButton } from "@/shared/ui/UiButton"

/**
 * Componente ProductCategory
 */
export function ProductCategory({
    typeContent: Component = "div",
    categories  = [],
    onClick,
    ...props
}){
    const [activeCategory, setActiveCategory] = useState(categories [0]?.value || "");
    
    /**
     * Maneja el cambio de categoría activa
     * @param {string} value - Valor de la categoría seleccionada
     */
    const handleCategoria = (label) => {
        setActiveCategory(label);
        onClick && onClick(label);
    };

    return (
        <Component {...props}>
            {categories .map(({ label, icon: Icon, value }) => (
                <UiButton 
                    key={value}
                    icon={Icon}
                    className={activeCategory === value ? "active" : ""}
                    onClick={() => handleCategoria(value)}
                >{label}</UiButton>
            ))}
        </Component>
    );
}