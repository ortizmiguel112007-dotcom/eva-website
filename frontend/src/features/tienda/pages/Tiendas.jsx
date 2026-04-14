import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { tiendaService } from "../services/tienda.service"
import axios from "axios"
import {
  FiSearch, FiArrowRight, FiPackage,
  FiShoppingBag, FiX, FiUsers, FiGrid, FiZap
} from "react-icons/fi"
import "@/infrastructure/css/Tiendas.css"

function getInitials(nombre) {
  if (!nombre) return "?"
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO")
}

const AVATAR_COLORS = [
  ["#3b82f6", "#1d4ed8"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#7c3aed", "#5b21b6"],
  ["#ef4444", "#dc2626"],
  ["#0891b2", "#0e7490"],
  ["#be185d", "#9d174d"],
  ["#65a30d", "#4d7c0f"],
]

function getAvatarGradient(nombre) {
  if (!nombre) return AVATAR_COLORS[0]
  const sum = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

export default function Tiendas() {
  const navigate  = useNavigate()
  const [tiendas, setTiendas]     = useState([])
  const [alianzas, setAlianzas]   = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState("")

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dataTiendas, dataAlianzas] = await Promise.all([
          tiendaService.getTiendas(),
          tiendaService.getAlianzas().catch(() => [])
        ])
        setTiendas(dataTiendas)
        setAlianzas(Array.isArray(dataAlianzas) ? dataAlianzas : [])
      } catch (err) { console.error(err) }
      finally { setCargando(false) }
    }
    cargar()
  }, [])

  const filtradas = tiendas.filter(t =>
    t.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const alianzasFiltradas = alianzas.filter(a =>
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.participantes?.some(p => p.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
  )

  return (
    <div className="ti-page">

      {/* ── Hero header ── */}
      <div className="ti-hero">
        <div className="ti-hero-blur ti-blur-1" />
        <div className="ti-hero-blur ti-blur-2" />
        <div className="ti-hero-content">
          <div className="ti-hero-tag">
            <FiUsers size={12} /> Comunidad EVA
          </div>
          <h1 className="ti-hero-titulo">Tiendas de Emprendedoras</h1>
          <p className="ti-hero-sub">
            <strong>{tiendas.length}</strong> emprendedoras compartiendo su talento
          </p>
        </div>

        <div className="ti-search-wrap">
          <FiSearch size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar tienda por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="ti-search-input"
          />
          {busqueda && (
            <button onClick={() => setBusqueda("")} className="ti-search-clear">
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="ti-contenido">

        {/* ── Sección Alianzas ── */}
        {alianzasFiltradas.length > 0 && (
          <div className="ti-alianzas-seccion">
            <div className="ti-seccion-header">
              <div className="ti-seccion-tag">
                <FiZap size={12} /> Campañas Colaborativas
              </div>
              <h2 className="ti-seccion-titulo">Tiendas en Alianza</h2>
              <p className="ti-seccion-sub">Emprendedoras que se unen para ofrecerte más</p>
            </div>

            <div className="ti-alianzas-grid">
              {alianzasFiltradas.map((a, idx) => {
                const productos = a.secciones?.flatMap(s => s.productos) || []
                const precioMin = productos.length
                  ? Math.min(...productos.map(p => Number(p.precio)))
                  : null

                return (
                  <div key={a.id_alianza}
                    className="ti-alianza-card"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => navigate(`/alianza/${a.id_alianza}`)}>

                    {/* Banner */}
                    <div className="ti-alianza-banner">
                      {productos.slice(0, 3).length > 0 ? (
                        productos.slice(0, 3).map((p, i) => (
                          <div key={i} className="ti-banner-img">
                            {p.imagen
                              ? <img src={p.imagen} alt={p.nombre_producto} />
                              : <div className="ti-banner-placeholder"><FiPackage size={20} color="#94a3b8" /></div>
                            }
                          </div>
                        ))
                      ) : (
                        <div className="ti-banner-empty">
                          <FiUsers size={36} color="#cbd5e1" />
                        </div>
                      )}
                      <div className="ti-banner-overlay" />
                      <span className="ti-alianza-badge-collab">
                        Campaña Colaborativa
                      </span>
                      <span className="ti-banner-badge">
                        <FiPackage size={10} /> {productos.length} productos
                      </span>
                    </div>

                    {/* Body */}
                    <div className="ti-card-body">
                      {/* Avatares participantes */}
                      <div className="ti-alianza-avatares">
                        {a.participantes?.map(p => {
                          const [c1, c2] = getAvatarGradient(p.usuario?.nombre)
                          return (
                            <div key={p.id} className="ti-alianza-avatar"
                              style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                              title={p.usuario?.nombre}>
                              {getInitials(p.usuario?.nombre)}
                            </div>
                          )
                        })}
                      </div>

                      <h3 className="ti-card-nombre">{a.nombre}</h3>

                      <p className="ti-alianza-participantes">
                        {a.participantes?.map(p => p.usuario?.nombre).join(" & ")}
                      </p>

                      {productos.length > 0 && (
                        <div className="ti-tags">
                          {productos.slice(0, 3).map(p => (
                            <span key={p.id_producto} className="ti-tag">{p.nombre_producto}</span>
                          ))}
                          {productos.length > 3 && (
                            <span className="ti-tag ti-tag-mas">+{productos.length - 3}</span>
                          )}
                        </div>
                      )}

                      {precioMin && (
                        <p className="ti-card-precio-desde">
                          Desde {formatPrecio(precioMin)}
                        </p>
                      )}

                      <button className="ti-btn-visitar ti-btn-alianza"
                        onClick={e => { e.stopPropagation(); navigate(`/alianza/${a.id_alianza}`) }}>
                        Ver campaña <FiArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Tiendas individuales ── */}
        <div className="ti-resultados-bar">
          <span className="ti-resultados-txt">
            <FiGrid size={13} />
            {busqueda
              ? `${filtradas.length} resultado${filtradas.length !== 1 ? "s" : ""} para "${busqueda}"`
              : `${filtradas.length} tienda${filtradas.length !== 1 ? "s" : ""} disponibles`}
          </span>
        </div>

        {cargando ? (
          <div className="ti-loading">
            <div className="ti-spinner" />
            <p>Cargando tiendas...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="ti-empty">
            <FiShoppingBag size={48} color="#cbd5e1" />
            <h3>No hay tiendas</h3>
            <p>{busqueda ? `Sin resultados para "${busqueda}"` : "Aún no hay tiendas registradas"}</p>
            {busqueda && (
              <button onClick={() => setBusqueda("")} className="ti-btn-limpiar">Limpiar búsqueda</button>
            )}
          </div>
        ) : (
          <div className="ti-grid">
            {filtradas.map((t, idx) => {
              const productos = t.secciones?.flatMap(s => s.productos) || []
              const [c1, c2]  = getAvatarGradient(t.usuario?.nombre)
              return (
                <div key={t.id_emprendedora}
                  className="ti-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => navigate(`/tienda/${t.id_emprendedora}`)}>

                  <div className="ti-card-banner">
                    {productos.slice(0, 3).length > 0 ? (
                      productos.slice(0, 3).map((p, i) => (
                        <div key={i} className="ti-banner-img">
                          {p.imagen
                            ? <img src={p.imagen} alt={p.nombre_producto} />
                            : <div className="ti-banner-placeholder"><FiPackage size={20} color="#94a3b8" /></div>
                          }
                        </div>
                      ))
                    ) : (
                      <div className="ti-banner-empty">
                        <FiShoppingBag size={36} color="#cbd5e1" />
                      </div>
                    )}
                    <div className="ti-banner-overlay" />
                    <span className="ti-banner-badge">
                      <FiPackage size={10} /> {productos.length} productos
                    </span>
                  </div>

                  <div className="ti-card-body">
                    <div className="ti-avatar-wrap">
                      <div className="ti-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                        {getInitials(t.usuario?.nombre)}
                      </div>
                    </div>
                    <h3 className="ti-card-nombre">{t.usuario?.nombre}</h3>
                    {productos.length > 0 && (
                      <div className="ti-tags">
                        {productos.slice(0, 3).map(p => (
                          <span key={p.id_producto} className="ti-tag">{p.nombre_producto}</span>
                        ))}
                        {productos.length > 3 && (
                          <span className="ti-tag ti-tag-mas">+{productos.length - 3}</span>
                        )}
                      </div>
                    )}
                    {productos.length > 0 && (
                      <p className="ti-card-precio-desde">
                        Desde {formatPrecio(Math.min(...productos.map(p => Number(p.precio))))}
                      </p>
                    )}
                    <button className="ti-btn-visitar"
                      onClick={e => { e.stopPropagation(); navigate(`/tienda/${t.id_emprendedora}`) }}>
                      Visitar tienda <FiArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}