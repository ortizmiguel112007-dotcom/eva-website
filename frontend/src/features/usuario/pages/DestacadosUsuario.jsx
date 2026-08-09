import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiStar, FiPackage, FiHeart } from "react-icons/fi"

import { tiendaService } from "@/features/tienda/services/tienda.service"
import { formatPrecio } from "@/features/tienda/utils/utils"
import { useProductoAcciones } from "@/features/tienda/hooks/useProductoAcciones"
import { BtnAgregar } from "@/features/tienda/components/shared/BtnAgregar"

import { DestacadosHero } from "../components/destacados/DestacadosHero"
import { DestacadosFiltros } from "../components/destacados/DestacadosFiltros"

import "@/infrastructure/css/usuario/destacados/DestacadosUsuario.css"


export default function DestacadosUsuario() {
  const navigate = useNavigate()
  const acciones = useProductoAcciones()

  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [catActiva, setCatActiva] = useState("Todos")
  const [hover, setHover]         = useState(null)

  useEffect(() => {
    tiendaService.getDestacados()
      .then(data => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false))
  }, [])

  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria).filter(Boolean))]
  const filtrados  = catActiva === "Todos"
    ? productos
    : productos.filter(p => p.categoria?.toLowerCase() === catActiva.toLowerCase())

  if (cargando) return (
    <div className="du-loading">
      <div className="du-spinner" />
      <p>Cargando destacados...</p>
    </div>
  )

  return (
    <div className="du-page">

      <DestacadosHero total={productos.length} />

      <DestacadosFiltros
        categorias={categorias}
        catActiva={catActiva}
        setCatActiva={setCatActiva}
      />

      {filtrados.length === 0 ? (
        <div className="du-empty">
          <FiStar size={48} color="#e5e7eb" />
          <p>No hay productos en esta categoría</p>
        </div>
      ) : (
        <div className="du-grid">
          {filtrados.map((p, idx) => {
            const agotado    = p.inventario?.cantidad === 0
            const yaAgregado = acciones.yaAgregado(p.id_producto)
            const esFav      = acciones.esFavorito(p.id_producto)

            return (
              <div key={p.id_producto}
                className={`du-card ${agotado ? "agotado" : ""}`}
                style={{ animationDelay: `${(idx % 6) * 0.05}s` }}
                onMouseEnter={() => setHover(p.id_producto)}
                onMouseLeave={() => setHover(null)}
                onClick={() => navigate(`/producto/${p.id_producto}`)}
              >
                <div className="du-card-img">
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre_producto}
                        style={{ transform: hover === p.id_producto ? "scale(1.06)" : "scale(1)" }} />
                    : <div className="du-no-img"><FiPackage size={36} color="#cbd5e1" /></div>
                  }
                  <div className="du-card-badges">
                    <span className="du-badge-dest">
                      <FiStar size={10} fill="#fff" color="#fff" /> Destacado
                    </span>
                    {p.tipo && <span className="du-badge-tipo">{p.tipo}</span>}
                  </div>
                  <button className={`du-fav-btn ${esFav ? "active" : ""}`}
                    onClick={e => acciones.toggleFav(e, p.id_producto)}>
                    <FiHeart size={14}
                      fill={esFav ? "#ef4444" : "none"}
                      color={esFav ? "#ef4444" : "#94a3b8"} />
                  </button>
                  {agotado && <div className="du-agotado-overlay"><span>Agotado</span></div>}
                </div>

                <div className="du-card-body">
                  <span className="du-card-cat">{p.categoria}</span>
                  <h3 className="du-card-nombre">{p.nombre_producto}</h3>
                  {p.descripcion && <p className="du-card-desc">{p.descripcion}</p>}
                  <span className="du-card-tienda">
                    {p.seccion?.emprendedora?.usuario?.nombre || "EVA"}
                  </span>
                  <div className="du-card-footer">
                    <span className="du-card-precio">{formatPrecio(p.precio)}</span>
                    <BtnAgregar
                      agregado={yaAgregado}
                      agotado={agotado}
                      tipo={p.tipo}
                      className="du-btn-agregar"
                      onClick={e => { e.stopPropagation(); acciones.handleAgregar(e, p) }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}