import { useMemo } from "react"

export function useAlianzasFiltradas(alianzas, busqueda) {
    return useMemo(() => {
        return alianzas.filter(a =>
            a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            a.participantes?.some(p =>
                p.usuario?.nombre
                    ?.toLowerCase()
                    .includes(busqueda.toLowerCase())
            )
        )
    }, [alianzas, busqueda])
}