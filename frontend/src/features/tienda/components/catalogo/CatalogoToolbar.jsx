import { useState } from "react";

// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import {
    FiChevronDown,
    FiSliders
} from "@/infrastructure/icons/index.js";

import { UiButton } from "@/shared/ui/UiButton"
// CatalogoToolbar
const Ordenadores = [
    { label: "Más recientes", value: "recientes" },
    { label: "Precio: menor a mayor", value: "precio_asc" },
    { label: "Precio: mayor a menor", value: "precio_desc" },
];

export function CatalogoToolbar({
    filtros,
    filtrados,
}) {
    const POR_PAGINA = 9;
    const visible = filtrados.slice(0, filtros.pagina * POR_PAGINA);

    return (
        <div className="cat-toolbar">
            <UiButton
                className="cat-toggle-sidebar"
                onClick={() => filtros.setSidebarOpen((p) => !p)}
                icon={FiSliders}
            >
                {filtros.sidebarOpen ? "Ocultar filtros" : "Mostrar filtros"}
            </UiButton>

            <span className="cat-toolbar-count">
                <strong>{visible.length}</strong> de{" "}
                <strong>{filtrados.length}</strong> resultados
            </span>
            
            <div className="cat-ordenar-wrap">
                <select
                    className="cat-ordenar"
                    value={filtros.ordenar}
                    onChange={(e) => filtros.setOrdenar(e.target.value)}
                >
                    {Ordenadores.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <FiChevronDown size={13} className="cat-ordenar-icon" />
            </div>
        </div>
    )
}