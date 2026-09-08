import { useState, useEffect } from "react"
import { useAuth } from "@/core/context/AuthConten"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FiStar, FiMessageSquare, FiShoppingBag } from "react-icons/fi"

import { ResenaCard } from "../components/resenas/ResenaCard"
import { StatsResenas } from "../components/resenas/StatsResenas"

import "@/infrastructure/css/usuario/resenas/MisResenas.css"
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function MisResenas() {
  const { token } = useAuth()
  const navigate  = useNavigate()

  const [resenas, setResenas]   = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro]     = useState(0)

  useEffect(() => {
    axios.get(`${API_URL}/api/cliente/pedidos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const coms = []
        res.data.forEach(p => {
          p.comentarios?.forEach(c => coms.push({ ...c, pedido: p }))
        })
        setResenas(coms)
      })
      .catch(() => setResenas([]))
      .finally(() => setCargando(false))
  }, [token])

  const promedio  = resenas.length
    ? (resenas.reduce((acc, r) => acc + r.calificacion, 0) / resenas.length).toFixed(1)
    : null

  const filtradas = filtro === 0
    ? resenas
    : resenas.filter(r => r.calificacion === filtro)

  if (cargando) return (
    <div className="mr-loading">
      <div className="mr-spinner" />
      <p>Cargando reseñas...</p>
    </div>
  )

  return (
    <div className="mr-page">
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
          <StatsResenas resenas={resenas} filtro={filtro} setFiltro={setFiltro} />

          <div className="mr-lista">
            {filtradas.length === 0 ? (
              <div className="mr-filtro-empty">
                <FiStar size={28} color="#e5e7eb" />
                <p>No hay reseñas de {filtro} estrella{filtro !== 1 ? "s" : ""}</p>
              </div>
            ) : filtradas.map(r => (
              <ResenaCard key={r.id_comentario} resena={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}