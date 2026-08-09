/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                        InicioHero                            ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Sección principal (Hero) de la página de inicio del marketplace. 
 * Actúa como la primera impresión para el usuario, presentando la 
 * propuesta de valor y métricas de impacto de la plataforma.
 *
 * ──────────────────────────────────────────────────────────────
 * 
 * 🎯 Responsabilidades:
 * - Comunicar el propósito del marketplace (apoyo a emprendedoras).
 * - Facilitar la navegación rápida hacia productos y tiendas.
 * - Visualizar datos dinámicos de participación (conteo de tiendas y productos).
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🔗 Dependencias:
 * - react-router-dom → Provee la función navigate para el flujo de la app.
 * - UiButton → Componente base para las llamadas a la acción (CTAs).
 * - infrastructure/icons → Centraliza los íconos FiZap, FiShoppingBag y FiUsers.
 *
 * ──────────────────────────────────────────────────────────────
 */

// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import {
    FiShoppingBag,
    FiUsers,
    FiZap
} from "@/infrastructure/icons/index.js";

// ══ Estilos ══════════
import "@/infrastructure/css/tienda/inicio/InicioHero.css";

// ══ Shared ════════════
import { UiButton } from "@/shared/ui/UiButton"
import { UIBase } from "@/shared/ui/UIStat";

// ══ Image ═════════════
import Imagen from "@/infrastructure/imgs/HeroInicio.png"
import PapelRasger from "@/infrastructure/imgs/PapelRasger.png"

/**
 * ⚙️ Parámetros (props):
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.navigate - Función para gestionar el enrutamiento.
 * @param {Array} [props.tiendas=[]] - Arreglo de tiendas para calcular el total de emprendedoras.
 * @param {Array} [props.catalogo=[]] - Arreglo de productos para mostrar el volumen del catálogo.
 */
export function InicioHero({
    navigate,
    tienda,
}) {
    return (
        <section className="ip-hero">
            <div className="ip-hero-content">
                <div className="ip-hero-container">
                    <div className="ip-hero-tag">
                        <FiZap size={12} />
                        Marketplace de Emprendedoras
                    </div>

                    <h1>
                        Descubre productos y servicios de{" "}
                        <span className="ip-hero-span">
                            mujeres emprendedoras
                        </span>
                    </h1>

                    <p className="ip-hero-desc">
                        Apoya el talento local. Encuentra productos únicos,
                        servicios profesionales y conecta directamente con
                        emprendedoras de tu ciudad.
                    </p>

                    <div className="ip-hero-actions">
                        <UiButton
                            icon={FiShoppingBag}
                            onClick={() => navigate("/catalogo")}
                            className="ip-btn primary"
                        >
                            Explorar productos
                        </UiButton>

                        <UiButton
                            icon={FiUsers}
                            onClick={() => navigate("/tiendas")}
                            className="ip-btn secondary"
                        >
                            Ver tiendas
                        </UiButton>
                    </div>

                    <div className="ip-hero-stats">
                        <div className="ip-stat">
                            <strong>{tienda.tiendas.length}+</strong>
                            <span>Emprendedoras</span>
                        </div>

                        <div className="ip-stat-divider" />

                        <div className="ip-stat">
                            <strong>{tienda.catalogo.length}+</strong>
                            <span>Productos</span>
                        </div>

                        <div className="ip-stat-divider" />

                        <div className="ip-stat">
                            <strong>100%</strong>
                            <span>Local</span>
                        </div>
                    </div>
                </div>

                <div className="image-container">
                    <img
                        src={Imagen}
                        alt="Imagen alternativa del inicio Hero"
                    />
                </div>

            </div>
            <div className="fondoPapel"></div>
        </section>
    )
}
/**
 * 🧩 Ejemplo de implementación:
 * 
 * <InicioHero 
 *    navigate={navigate} 
 *    tiendas={listaDeTiendas} 
 *    catalogo={listaDeProductos} 
 * />
 */