import { useEffect, useState } from "react";

export function useFiltrosCatalogo(precioMax) {
    const [busqueda, setBusqueda] = useState("");
    const [tipoActivo, setTipoActivo] = useState("");
    const [cats, setCats] = useState([]);
    const [ordenar, setOrdenar] = useState("recientes");
    const [pagina, setPagina] = useState(1);

    const [rangoMax, setRangoMax] = useState(precioMax);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        setRangoMax(precioMax);
    }, [precioMax]);

    const toggleCat = (val) => {
        if (!val || Array.isArray(val)) return;

        setCats((prev) =>
            prev.includes(val)
                ? prev.filter((c) => c !== val)
                : [...prev, val]
        );

        setPagina(1)
    }

    const toggleTipo = (val) => {
        setTipoActivo((prev) => (prev === val ? "" : val));
        setPagina(1);
    };

    const clearCats = () => {
        setCats([]);
    };

    return {
        busqueda,
        setBusqueda,

        tipoActivo,
        setTipoActivo,
        toggleTipo,

        cats,
        toggleCat,
        clearCats,

        ordenar,
        setOrdenar,

        pagina,
        setPagina,

        rangoMax,
        setRangoMax,

        sidebarOpen,
        setSidebarOpen
    };
}