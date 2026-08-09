import { useState, useEffect, useMemo } from "react";

// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import {
    FiSliders
} from "@/infrastructure/icons/index.js";

import { Categories, Tipo } from "@/data/categories"

import { formatPrecio } from "@/features/tienda/utils/utils";

// ══ Shared ════════════
import { UiButton } from "@/shared/ui/UiButton"
import { CategoryFilterList } from "@/shared/product/CategoryFilterList"

import "@/infrastructure/css/tienda/catalogo/CatalogoToolbar.css";

export function CatalogoSidebar({
    filtros,
    catalogo
}) {
    const hayFiltros = filtros.cats.length > 0 || filtros.tipoActivo || filtros.rangoMax < catalogo.precioMax;

    const contadorCat = (val) =>
        catalogo.todos.filter(
            (p) => p.categoria === val && (!filtros.tipoActivo || p.tipo === filtros.tipoActivo),
        ).length;

    const contadorActivate = (val) =>
        catalogo.todos.filter((p) => p.Tipo === val || p.tipo === val).length;

    const limpiarFiltros = () => {
        filtros.clearCats();
        filtros.setTipoActivo("");
        filtros.setRangoMax(catalogo.precioMax);
        filtros.setPagina(1);
    };

    return (
        <aside className={`cats-sidebar ${filtros.sidebarOpen ? "" : "closed"}`}>
            <div className="cat-sidebar-header">
                <div className="cat-sidebar-titulo">
                    <FiSliders /> Filtros
                    {hayFiltros && (
                        <span className="cat-filtros-badge">
                            {filtros.cats.length +
                                (filtros.tipoActivo ? 1 : 0) +
                                (filtros.rangoMax < catalogo.precioMax ? 1 : 0)}
                        </span>
                    )}
                </div>
                {hayFiltros && (
                    <UiButton
                        className="cat-btn-limpiar"
                        onClick={limpiarFiltros}
                    >Limpiar</UiButton>
                )}
            </div>

            {/* Precio */}
            <div className="cat-sidebar-seccion">
                <h4 className="cat-sidebar-seccion-titulo">Precio máximo</h4>
                <input
                    type="range"
                    min={0}
                    max={catalogo.precioMax}
                    value={filtros.rangoMax}
                    step={1}
                    className="cat-slider"
                    onChange={(e) => {
                        filtros.setRangoMax(Number(e.target.value));
                        filtros.setPagina(1);
                    }}
                />
                <div className="cat-precio-labels">
                    <span>$0</span>
                    <span className="cat-precio-val">{formatPrecio(filtros.rangoMax)}</span>
                </div>
            </div>

            {/* Categorías */}
            <div className="cat-sidebar-seccion">
                <CategoryFilterList
                    name="Tipo"
                    categories={Tipo}
                    selected={filtros.tipoActivo}
                    onToggle={filtros.toggleTipo}
                    contador={contadorActivate}
                />

                <CategoryFilterList
                    categories={Categories}
                    selected={filtros.cats}
                    onToggle={filtros.toggleCat}
                    contador={contadorCat}
                    name="Categorías"
                />
            </div>
        </aside>
    )
}