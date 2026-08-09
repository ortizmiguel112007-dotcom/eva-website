import { useNavigate } from "react-router-dom"

// ══ Estilos ══════════
import "@/infrastructure/css/tienda/tiendas/Tiendas.css"

// ══ Shared ═══════════
import { SpaceHero } from "../components/shared/SpaceHero"

// ══ Hooks ════════════
import { useTiendas } from "../hooks/tiendas/useTienda"
import { useAlianzasFiltradas } from "../hooks/tiendas/useAlianzasFiltradas"
import { useTiendasFiltradas } from "@/features/tienda/hooks/tiendas/useTiendasFiltradas"

// ══ Utils ════════════
import {
  getAvatarColor,
  getInitials,
  formatPrecio
} from "../utils/utils"

// ══ components ═══════
import { TiendasCartShop } from "../components/tiendas/TiendasCartShop"

export default function Tiendas() {
  const navigate = useNavigate()
  const tiendaState = useTiendas()

  const alianzasFiltradas =
    useAlianzasFiltradas(
      tiendaState.alianzas,
      tiendaState.busqueda
    )

  const tiendasFiltradas =
    useTiendasFiltradas(
      tiendaState.tiendas,
      tiendaState.busqueda
    )

  return (

    <div className="ti-page">

      {/* Hero */}
      <SpaceHero
        titulo="Tiendas de emprendedoras"
        subtitulo={
          `${tiendaState.tiendas.length}
          emprendedoras compartiendo su talento`
        }
        busqueda={tiendaState.busqueda}
        setBusqueda={tiendaState.setBusqueda}
        placeholder="Buscar tiendas..."
      />

      {/* Contenido */}
      <div className="ti-contenido">

        {/* Tiendas */}
        <TiendasCartShop
          alianzasFiltradas={alianzasFiltradas}
          tiendasFiltradas={tiendasFiltradas}
          navigate={navigate}
          tiendaState={tiendaState}
        />
      </div>
    </div>
  )
}