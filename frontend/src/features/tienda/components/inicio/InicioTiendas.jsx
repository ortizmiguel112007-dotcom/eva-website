/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                        InicioTiendas                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 📌 Descripción:
 * Sección dedicada a resaltar las tiendas de las emprendedoras en la 
 * página de inicio. Permite una visualización rápida de la comunidad
 * y sus productos destacados.
 *
 * ──────────────────────────────────────────────────────────────
 * 
 * 🎯 Responsabilidades:
 * - Renderizado condicional: La sección solo se muestra si existen tiendas.
 * - Transformación de datos: Aplana las secciones para extraer productos.
 * - Limitación visual: Muestra un máximo de 4 tiendas para el Home.
 * - Navegación: Acceso al directorio completo de tiendas y a perfiles individuales.
 *
 * ──────────────────────────────────────────────────────────────
 *
 * 🔗 Dependencias:
 * - UiButton: Botón de acción para ver el directorio completo.
 * - StoreCard: Componente compartido para representar la información de la tienda.
 * - infrastructure/icons: Utiliza FiUsers y FiArrowRight.
 *
 * ──────────────────────────────────────────────────────────────
 */

// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import {
    FiUsers,
    FiArrowRight
} from "@/infrastructure/icons/index.js";

// ══ Shared ════════════
import { UiButton } from "@/shared/ui/UiButton";
import { StoreCard } from "@/shared/store/storeCard";

import { useTiendasFiltradas } from "@/features/tienda/hooks/tiendas/useTiendasFiltradas"

/**
 * ⚙️ Parámetros (props):
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.navigate - Función para el manejo de rutas.
 * @param {Array} [props.tiendas=[]] - Colección de objetos de emprendedoras.
 */
export function InicioTiendas({
    navigate,
    tienda,
}) {
    const tiendasFiltradas =
        useTiendasFiltradas(
            tienda.tiendas,
        )
    return (
        <>
            {tiendasFiltradas.length > 0 && (
                <section className="ip-seccion ip-seccion-alt">
                    <div className="ip-seccion-header">
                        <div>
                            <div className="ip-seccion-tag">
                                <FiUsers size={12} /> Comunidad
                            </div>
                            <h2>Tiendas de Emprendedoras</h2>
                            <p>Conoce a las mujeres detrás de cada producto</p>
                        </div>
                        <UiButton
                            className="ip-btn tertiary"
                            onClick={() => navigate("/tiendas")}
                            iconPosition="r"
                            icon={FiArrowRight}
                        >
                            Ver todas
                        </UiButton>
                    </div>

                    <div className="ip-tiendas-grid">
                        {tiendasFiltradas.map((t) => {

                            const seccionesPropias =
                                t.secciones?.filter(
                                    (s) => s.id_alianza === null
                                ) || []

                            const productos =
                                seccionesPropias.flatMap(
                                    (s) => s.productos || []
                                )

                            return (

                                <StoreCard
                                    key={t.id_emprendedora}
                                    className="ip-tienda-card"
                                    productos={productos}
                                    tiendas={t}
                                    nombre={t.usuario?.nombre}
                                    onClick={() =>
                                        navigate(
                                            `/tienda/${t.id_emprendedora}`
                                        )
                                    }
                                />
                            )
                        })}
                    </div>
                </section>
            )}
        </>
    )
}
/**
 * 🧩 Ejemplo de implementación:
 * 
 * <InicioTiendas 
 *    navigate={navigate} 
 *    tiendas={listadoEmprendedoras} 
 * />
 */