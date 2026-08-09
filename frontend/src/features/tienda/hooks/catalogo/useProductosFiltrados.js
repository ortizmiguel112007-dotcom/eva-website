import { useMemo } from "react"

export function useProductosFiltrados({
    catalogo,
    filtros
}) {
    return useMemo(() => {
        const texto = filtros.busqueda.toLowerCase();

        let result = catalogo.todos.filter((p) => {
            const matchB =
                p.nombre_producto?.toLowerCase().includes(texto) ||
                p.categoria?.toLowerCase().includes(texto) ||
                p.seccion?.emprendedora?.usuario?.nombre
                    ?.toLowerCase()
                    .includes(texto);

            const matchT =
                !filtros.tipoActivo || p.tipo === filtros.tipoActivo;

            const matchC =
                filtros.cats.length === 0 ||
                filtros.cats.includes(p.categoria);

            const matchP =
                Number(p.precio) <= filtros.rangoMax;

            return (
                matchB &&
                matchT &&
                matchC &&
                matchP
            );
        });

        switch (filtros.ordenar) {
            case "precio_asc":
                result.sort(
                    (a, b) =>
                        Number(a.precio) - Number(b.precio)
                );
                break;

            case "precio_desc":
                result.sort(
                    (a, b) =>
                        Number(b.precio) - Number(a.precio)
                );
                break;
        }

        return result;
    }, [
        catalogo.todos,
        filtros.busqueda,
        filtros.tipoActivo,
        filtros.cats,
        filtros.rangoMax,
        filtros.ordenar
    ]);
}