import { useMemo } from "react"
import { useNavigate } from "react-router-dom"

import "@/infrastructure/css/tienda/catalogo/catalogo.css"

import { SpaceHero } from "../components/shared/SpaceHero"
import { CatalogoSidebar } from "../components/catalogo/CatalogoSidebar"
import { CatalogoToolbar } from "../components/catalogo/CatalogoToolbar"
import { CatalogoGrid } from "../components/catalogo/CatalogoGrid"

import { useCatalogo } from "@/features/tienda/hooks/catalogo/useCatalogo"
import { useFiltrosCatalogo } from "@/features/tienda/hooks/catalogo/useFiltrosCatalogo"
import { useProductosFiltrados } from "@/features/tienda/hooks/catalogo/useProductosFiltrados"
import { tiendaService } from "@/features/tienda/services/tienda.service"

export default function Catalogo({
  // props opcionales — usuario las pasa, tienda no
  GridComponent,
  gridProps = {},
  titulo = "Catálogo",
  placeholder = "Buscar productos...",
}) {
  const navigate  = useNavigate()
  const catalogo  = useCatalogo(tiendaService.getCatalogo)
  const filtros   = useFiltrosCatalogo(catalogo.precioMax)
  const filtrados = useProductosFiltrados({ catalogo, filtros })
  const visible   = filtrados.slice(0, filtros.pagina * 9)

  // Si usuario pasa su propio grid lo usa, si no usa el de tienda
  const Grid = GridComponent || CatalogoGrid

  return (
    <div className="cat-page">
      <SpaceHero
        titulo={titulo}
        subtitulo={`${filtrados.length} productos y servicios disponibles`}
        busqueda={filtros.busqueda}
        setBusqueda={filtros.setBusqueda}
        setPagina={filtros.setPagina}
        placeholder={placeholder}
      />

      <div className="cat-body">
        <CatalogoSidebar filtros={filtros} catalogo={catalogo} />
        <main className="cat-main">
          <CatalogoToolbar filtros={filtros} filtrados={filtrados} />
          <Grid
            navigate={navigate}
            filtros={filtros}
            filtrados={filtrados}
            catalogo={catalogo}
            visible={visible}
            {...gridProps}
          />
        </main>
      </div>
    </div>
  )
}