import { useState, useEffect, useMemo } from "react";

export function useCatalogo(fetchFn) {
    const [todos, setTodos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const precioMax = useMemo(
        () =>
            todos.length
                ? Math.ceil(Math.max(...todos.map((p) => Number(p.precio))) / 1000) *
                1000
                : 5000000,
        [todos],
    );

    useEffect(() => {
        const cargar = async () => {
            setCargando(true);
            try {
                const data = await fetchFn();
                setTodos(data);
            } catch (error) {
                console.error(error);
            } finally {
                setCargando(false)
            }
        }

        cargar();
    }, [])

    return {
        todos,
        cargando,
        precioMax
    }
}