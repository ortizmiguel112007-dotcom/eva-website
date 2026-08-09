import { useMemo } from "react";

export function useTiendasFiltradas(
    tiendas = [],
    busqueda = ""
) {

    return useMemo(() => {

        const texto =
            busqueda.toLowerCase()

        return tiendas.filter((t) => {

            // Solo secciones propias
            const seccionesPropias =
                t.secciones?.filter(
                    (s) => s.id_alianza === null
                ) || []

            // Productos reales de la tienda
            const productos =
                seccionesPropias.flatMap(
                    (s) => s.productos || []
                )

            // Evitar tiendas vacías
            const tieneProductos =
                productos.length > 0

            // Filtro búsqueda
            const matchBusqueda =
                t.usuario?.nombre
                    ?.toLowerCase()
                    .includes(texto)

            return (
                tieneProductos &&
                matchBusqueda
            )
        })

    }, [tiendas, busqueda])
}