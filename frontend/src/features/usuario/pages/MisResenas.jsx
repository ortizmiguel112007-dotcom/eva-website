import { useState, useEffect } from "react"
import { useAuth } from "@/core/context/AuthConten"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FiStar, FiMessageSquare, FiPackage, FiCalendar, FiShoppingBag } from "react-icons/fi"
import "@/infrastructure/css/MisResenas.css"

function formatFecha(f) {
  return new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric"
  })
}

function Estrellas({ valor, size = 14 }) {
  return (
    <div className="mr-estrellas">
      {[1, 2, 3, 4, 5].map(i => (
        <FiStar key={i} size={size}
          fill={i <= valor ? "#f59e0b" : "none"}
          color={i <= valor ? "#f59e0b" : "#d1d5db"} />
      ))}
      <span className="mr-estrella-num">{valor}.0</span>
    </div>
  )
}

export default function MisResenas() {
  const { token } = useAuth()
  const navigate  = useNavigate()
  const [resenas, setResenas]   = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro]     = useState(0) // 0 = todos

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/cliente/pedidos", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const coms = []
        res.data.forEach(p => {
          p.comentarios?.forEach(c => coms.push({ ...c, pedido: p }))
        })
        setResenas(coms)
      } catch { setResenas([]) }
      finally { setCargando(false) }
    }
    cargar()
  }, [token])

  const promedio = resenas.length
    ? (resenas.reduce((acc, r) => acc + r.calificacion, 0) / resenas.length).toFixed(1)
    : null

  const filtradas = filtro === 0
    ? resenas
    : resenas.filter(r => r.calificacion === filtro)

  const contPorEstrella = [5, 4, 3, 2, 1].map(n => ({
    n, count: resenas.filter(r => r.calificacion === n).length
  }))

  if (cargando) return (
    <div className="mr-loading">
      <div className="mr-spinner" />
      <p>Cargando reseñas...</p>
    </div>
  )

  return (
    <div className="mr-page">

      {/* Header */}
      <div className="mr-header">
        <div className="mr-header-text">
          <h1 className="mr-titulo">Mis Reseñas</h1>
          <p className="mr-sub">Opiniones que has dejado sobre tus compras</p>
        </div>
        {resenas.length > 0 && (
          <div className="mr-promedio-badge">
            <FiStar size={20} fill="#f59e0b" color="#f59e0b" />
            <span className="mr-promedio-num">{promedio}</span>
            <span className="mr-promedio-label">promedio</span>
          </div>
        )}
      </div>

      {resenas.length === 0 ? (
        <div className="mr-empty">
          <div className="mr-empty-blob" />
          <div className="mr-empty-content">
            <div className="mr-empty-icono">
              <FiMessageSquare size={36} color="#a5b4fc" />
            </div>
            <h3>Aún no has dejado reseñas</h3>
            <p>Puedes reseñar productos de pedidos que ya hayas recibido</p>
            <button className="mr-btn-primary" onClick={() => navigate("/mis-pedidos")}>
              <FiShoppingBag size={15} /> Ver mis pedidos
            </button>
          </div>
        </div>
      ) : (
        <div className="mr-layout">

          {/* Sidebar stats */}
          <aside className="mr-sidebar">
            <div className="mr-stats-card">
              <p className="mr-stats-titulo">Distribución</p>
              {contPorEstrella.map(({ n, count }) => (
                <div key={n} className="mr-bar-row"
                  onClick={() => setFiltro(filtro === n ? 0 : n)}
                  style={{ cursor: 'pointer', opacity: filtro !== 0 && filtro !== n ? 0.4 : 1 }}>
                  <span className="mr-bar-num">{n}</span>
                  <FiStar size={11} fill="#f59e0b" color="#f59e0b" />
                  <div className="mr-bar-track">
                    <div className="mr-bar-fill"
                      style={{ width: resenas.length ? `${(count / resenas.length) * 100}%` : "0%" }} />
                  </div>
                  <span className="mr-bar-count">{count}</span>
                </div>
              ))}
              {filtro !== 0 && (
                <button className="mr-btn-limpiar" onClick={() => setFiltro(0)}>
                  Mostrar todas
                </button>
              )}
            </div>

            <div className="mr-total-card">
              <FiMessageSquare size={20} color="#6366f1" />
              <strong>{resenas.length}</strong>
              <span>reseña{resenas.length !== 1 ? "s" : ""} publicada{resenas.length !== 1 ? "s" : ""}</span>
            </div>
          </aside>

          {/* Lista reseñas */}
          <div className="mr-lista">
            {filtradas.length === 0 ? (
              <div className="mr-filtro-empty">
                <FiStar size={28} color="#e5e7eb" />
                <p>No hay reseñas de {filtro} estrella{filtro !== 1 ? "s" : ""}</p>
              </div>
            ) : filtradas.map(r => (
              <div key={r.id_comentario} className="mr-card">
                {/* Cabecera */}
                <div className="mr-card-top">
                  <div className="mr-card-meta">
                    <div className="mr-card-pedido">
                      <FiPackage size={12} />
                      <span>Pedido #{r.pedido?.id_pedido}</span>
                    </div>
                    <div className="mr-card-fecha">
                      <FiCalendar size={12} />
                      <span>{formatFecha(r.fecha)}</span>
                    </div>
                  </div>
                  <Estrellas valor={r.calificacion} />
                </div>

                {/* Texto */}
                <p className="mr-card-texto">"{r.texto}"</p>

                {/* Footer */}
                <div className="mr-card-footer">
                  <span className="mr-card-tienda">
                    {r.pedido?.seccion?.emprendedora?.usuario?.nombre || "EVA"}
                  </span>
                  <div className={`mr-card-cal cal-${r.calificacion}`}>
                    {r.calificacion === 5 ? "Excelente" :
                     r.calificacion === 4 ? "Muy bueno" :
                     r.calificacion === 3 ? "Bueno" :
                     r.calificacion === 2 ? "Regular" : "Malo"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}