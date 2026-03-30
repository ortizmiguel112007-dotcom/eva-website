import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { tiendaService } from "../services/tienda.service"
import { FiSearch } from "react-icons/fi"
import "@/infrastructure/css/inicio.css"

function getInitials(nombre) {
  if (!nombre) return "?"
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}

function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CO")
}

const AVATAR_COLORS = [
  "#3b82f6", "#059669", "#d97706", "#7c3aed",
  "#ef4444", "#0891b2", "#be185d", "#65a30d"
]

function getAvatarColor(nombre) {
  if (!nombre) return AVATAR_COLORS[0]
  const sum = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

export default function Tiendas() {
  const navigate = useNavigate()
  const [tiendas, setTiendas]   = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await tiendaService.getTiendas()
        setTiendas(data)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const filtradas = tiendas.filter(t =>
    t.usuario?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="inicio-page">
      <div className="inicio-seccion">

        {/* Header */}
        <div className="inicio-seccion-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.7rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Tiendas de Emprendedoras
            </h2>
            <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
              {filtradas.length} tiendas disponibles
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div style={{ position: 'relative', marginBottom: '1.75rem', maxWidth: '420px' }}>
          <FiSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar tienda por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 1rem 0.6rem 2.4rem',
              borderRadius: '999px', border: '1.5px solid #e5e7eb',
              background: '#fff', fontSize: '0.88rem', outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#3b82f6'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Grid tiendas */}
        {cargando ? (
          <div className="pub-loading">Cargando tiendas...</div>
        ) : filtradas.length === 0 ? (
          <div className="pub-empty">No hay tiendas disponibles</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {filtradas.map(t => {
              const productos = t.secciones?.flatMap(s => s.productos) || []
              const totalProductos = productos.length

              return (
                <div
                  key={t.id_emprendedora}
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.85rem',
                    overflow: 'hidden',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  onClick={() => navigate(`/tienda/${t.id_emprendedora}`)}
                >
                  {/* Banner con fotos de productos */}
                  <div style={{ height: '120px', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', overflow: 'hidden' }}>
                    {productos.slice(0, 3).map((p, i) => (
                      <div key={i} style={{ overflow: 'hidden' }}>
                        {p.imagen
                          ? <img src={p.imagen} alt={p.nombre_producto} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '120px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>
                        }
                      </div>
                    ))}
                    {productos.length === 0 && (
                      <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🏪</div>
                    )}
                  </div>

                  {/* Info tienda */}
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '3rem', height: '3rem', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${getAvatarColor(t.usuario?.nombre)}, ${getAvatarColor(t.usuario?.nombre)}aa)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                        border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        marginTop: '-2rem', position: 'relative', zIndex: 1
                      }}>
                        {getInitials(t.usuario?.nombre)}
                      </div>
                      <div>
                        <h3 style={{ font: '700 1rem/1.3 "DM Sans", system-ui', color: '#1e293b', margin: 0 }}>
                          {t.usuario?.nombre}
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>
                    </div>

                    {/* Productos preview */}
                    {productos.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {productos.slice(0, 4).map(p => (
                          <span key={p.id_producto} style={{
                            fontSize: '0.72rem', padding: '0.2rem 0.6rem',
                            background: '#f1f5f9', borderRadius: '999px',
                            color: '#64748b', fontWeight: 500
                          }}>
                            {p.nombre_producto}
                          </span>
                        ))}
                        {productos.length > 4 && (
                          <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 600 }}>
                            +{productos.length - 4} más
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      className="btn-visitar-tienda"
                      onClick={e => { e.stopPropagation(); navigate(`/tienda/${t.id_emprendedora}`) }}
                    >
                      Visitar tienda →
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