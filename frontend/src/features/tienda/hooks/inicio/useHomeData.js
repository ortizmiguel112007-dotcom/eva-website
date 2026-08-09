/**
 * 📄 Hook para cargar datos del Home de la tienda
 * 
 * Centraliza la lógica de obtención de datos iniciales:
 * - Tiendas
 * - Catálogo
 * - Productos destacados
 * 
 * Optimiza el rendimiento realizando las peticiones en paralelo
 * y expone un estado de carga para controlar la UI.
 * 
 * @hook
 * 
 * @example
 * // Uso básico dentro de un componente
 * import { useHomeData } from "@/hooks/useHomeData";
 * 
 * export function Home() {
 *   const { tiendas, catalogo, destacados, cargando } = useHomeData();
 * 
 *   if (cargando) return <span>Cargando...</span>;
 * 
 *   return (
 *     <>
 *       <h1>Tiendas: {tiendas.length}</h1>
 *       <h2>Productos: {catalogo.length}</h2>
 *     </>
 *   );
 * }
 * 
 * @returns {Object} Datos y estado del hook
 * @returns {Array} tiendas        - Lista de tiendas obtenidas desde la API
 * @returns {Array} catalogo       - Lista de productos del catálogo
 * @returns {Array} destacados     - Lista de productos destacados
 * @returns {boolean} cargando     - Indica si los datos aún se están cargando
 */

// Hooks de React para estado y ciclo de vida
import { useState, useEffect } from "react";

// ══ API ══════════════
import { tiendaService } from "@/features/tienda/services/tienda.service.js";

export function useHomeData() {
    const [tiendas, setTiendas] = useState([])
    const [destacados, setDestacados] = useState([])
    const [cargando, setCargando] = useState(true)
    const [catalogo, setCatalogo] = useState([])

    useEffect(() => {
        /**
         * Carga inicial de datos del home
         * 
         * - Ejecuta llamadas en paralelo para optimizar rendimiento
         * - Actualiza múltiples estados con la respuesta
         * - Controla estado de carga global del componente
         */
        const cargar = async () => {
            try {
                const [dest, tiend, cat] = await Promise.all([
                    tiendaService.getDestacados(),
                    tiendaService.getTiendas(),
                    tiendaService.getCatalogo(),
                ]);
                setDestacados(dest);
                setTiendas(tiend);
                setCatalogo(cat)
            } catch (error) {
                console.log(error)
            } finally {
                setCargando(false)
            }
        }

        cargar()
    }, []);

    return { 
        tiendas, 
        setTiendas,

        catalogo,
        setCatalogo,

        destacados, 
        setDestacados,
        
        cargando,
        setCargando
    };
}