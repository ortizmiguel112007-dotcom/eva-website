import { FiStar, FiZap } from "react-icons/fi"
import "@/infrastructure/css/usuario/destacados/DestacadosHero.css"

export function DestacadosHero({ total }) {
  return (
    <div className="du-hero">
      <div className="du-hero-blur du-blur-1" />
      <div className="du-hero-blur du-blur-2" />
      <div className="du-hero-content">
        <div className="du-hero-badge">
          <FiZap size={12} /> Selección especial
        </div>
        <h1 className="du-hero-titulo">Ofertas &amp; Destacados</h1>
        <p className="du-hero-sub">
          Productos seleccionados por nuestras emprendedoras —
          <strong> {total}</strong> disponibles
        </p>
      </div>
      <div className="du-hero-stars">
        {[...Array(6)].map((_, i) => (
          <FiStar key={i} className="du-star-deco"
            size={i % 2 === 0 ? 16 : 10}
            fill="#f59e0b" color="#f59e0b"
            style={{ animationDelay: `${i * 0.4}s`, top: `${15 + i * 12}%`, right: `${8 + i * 6}%` }}
          />
        ))}
      </div>
    </div>
  )
}