// ══ Íconos ════════════
import {
    FiSearch,
    FiX
} from "@/infrastructure/icons/index.js"

// ══ Shared ════════════
import { UiButton } from "@/shared/ui/UiButton"

// ══ Estilos ════════════
import "@/infrastructure/css/shared/store/SpaceHero.css"

export function SpaceHero({
    titulo,
    subtitulo,
    busqueda,
    setBusqueda,
    setPagina,
    placeholder,
    iconTag: Icon,
    nombreTag
}) {

    return (
        <div className="cat-hero">

            <div className="cat-hero-blur cat-b1" />
            <div className="cat-hero-blur cat-b2" />

            <div className="cat-hero-content">

                {Icon && (
                    <div className="ti-hero-tag">
                        <Icon />
                        {nombreTag}
                    </div>
                )}

                <h1 className="cat-hero-titulo">
                    {titulo}
                </h1>

                <p className="cat-hero-sub">
                    {subtitulo}
                </p>

                {/* Search */}
                <div className="cat-search-wrap">
                    <FiSearch
                        size={16}
                        color="#94a3b8"
                    />

                    <input
                        className="cat-search-input"
                        type="text"
                        placeholder={placeholder}
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda?.(e.target.value)
                            setPagina?.(1)
                        }}
                    />

                    {busqueda && (
                        <UiButton
                            className="cat-search-clear"
                            onClick={() => setBusqueda?.("")}
                            icon={FiX}
                        />
                    )}

                </div>
            </div>
        </div>
    )
}

// export function SpaceHero({
//     titulo,
//     subtitulo,
//     busqueda,
//     setBusqueda,
//     placeholder,
//     iconTag: Icon,
//     nombreTag
// }) {
//     return (
//         <div className="cat-hero">
//             <div className="cat-hero-blur cat-b1" />
//             <div className="cat-hero-blur cat-b2" />
//             <div className="cat-hero-content">
//                 { Icon &&
//                 <div className="ti-hero-tag">
//                     <Icon/> {nombreTag}
//                 </div>
//                 }
//                 <h1 className="cat-hero-titulo">{nombre}</h1>
//                 <p className="cat-hero-sub">
//                     <strong>{filtrados.length}</strong> productos y servicios disponibles
//                 </p>

//                 {/* Buscador */}
//                 <div className="cat-search-wrap">
//                     <FiSearch size={16} color="#94a3b8" />
//                     <input
//                         className="cat-search-input"
//                         type="text"
//                         placeholder="Buscar productos, servicios, emprendedoras..."
//                         value={filtros.busqueda}
//                         onChange={(e) => {
//                             setBusqueda(e.target.value);
//                             filtros.setPagina(1);
//                         }}
//                     />
//                     {filtros.busqueda && (
//                         <UiButton
//                             className="cat-search-clear"
//                             onClick={() => filtros.setBusqueda("")}
//                             icon={FiX}
//                         />
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }