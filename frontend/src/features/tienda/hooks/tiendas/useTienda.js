import { useEffect, useState } from "react";
import { tiendaService } from "../../services/tienda.service";

export function useTiendas() {
    const [tiendas, setTiendas] = useState([])
    const [alianzas, setAlianzas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        const cargar = async () => {
            try {
                const [dataTiendas, dataAlianzas] = await Promise.all([
                    tiendaService.getTiendas(),
                    tiendaService.getAlianzas().catch(() => [])
                ])

                setTiendas(dataTiendas)
                setAlianzas(Array.isArray(dataAlianzas) ? dataAlianzas : [])
            } catch (err){
                console.error(err)
            } finally {
                setCargando(false)
            }
        }

        cargar()
    }, [])

    return {
        busqueda,
        setBusqueda,

        tiendas,
        setTiendas,

        alianzas,
        setAlianzas,

        cargando,
        setCargando
    }
}