/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                      InicioDestacados                        ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Componente encargado de renderizar la galería de productos destacados 
 * en la página principal. Filtra y muestra los artículos con mayor 
 * relevancia para incentivar la conversión inmediata.
 *
 * ──────────────────────────────────────────────────────────────
 * 
 * 🎯 Responsabilidades:
 * - Presentar el encabezado de sección con branding visual (Tag "Destacados").
 * - Iterar y renderizar una lista de objetos de producto usando `ProductCard`.
 * - Proveer acceso directo al catálogo completo.
 * - Gestionar la navegación hacia el detalle individual de cada producto.
 *
 * ──────────────────────────────────────────────────────────────
 * 
 * 🔗 Dependencias:
 * - UiButton: Utilizado para el CTA "Ver todos" con ícono posicionado a la derecha.
 * - ProductCard: Componente compartido para la visualización de datos del producto.
 * - React Icons (FiStar, FiArrowRight): Identificadores visuales de la sección.
 * 
 * ──────────────────────────────────────────────────────────────
 */

// Hooks de React para estado y ciclo de vida
import { useState, useEffect } from "react";

// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import {
    FiStar,
    FiArrowRight
} from "@/infrastructure/icons/index.js";

// ══ Estilos ══════════
import "@/infrastructure/css/shared/ui/UiButton.css";

// ══ Shared ════════════
import { UiButton } from "@/shared/ui/UiButton"
import { ProductCard } from "@/shared/product/ProductCard"

/**
 * ⚙️ Parámetros (props):
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.navigate - Instancia de navegación para redirecciones.
 * @param {Array} [props.destacados=[]] - Colección de objetos de producto. 
 * Cada objeto debe contener al menos: id_producto, nombre, precio e imagen.
 */
export function InicioDestacados({
    navigate,
    tienda
}) {
    return (
        <section className="ip-container">
            <div className="ip-seccion">
                <div className="ip-seccion-header">
                    <div>
                        <div className="ip-seccion-tag">
                            <FiStar size={12} /> Destacados
                        </div>
                        <h2>Productos Destacados</h2>
                        <p>Los más populares de nuestras emprendedoras</p>
                    </div>

                    <UiButton
                        onClick={() => navigate("/catalogo")}
                        className="ip-btn tertiary"
                        iconPosition="r"
                        icon={FiArrowRight}
                    >Ver todos</UiButton>
                </div>

                {<div className="ip-grid-4">
                    {tienda.destacados.map((product) => (
                        <ProductCard
                            product={product}
                            key={product.id_producto}
                            onClick={() => navigate(`/producto-detalle/${product.id_producto}`)}
                        />
                    ))}
                </div>}
            </div>
        </section>
    )
}
/**
 * 🧩 Ejemplo de uso en Inicio.jsx:
 * 
 * <InicioDestacados 
 *    navigate={navigate} 
 *    destacados={data.productosDestacados} 
 * />
 */