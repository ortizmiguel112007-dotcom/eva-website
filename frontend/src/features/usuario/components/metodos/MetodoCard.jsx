import { FiArrowRight } from "react-icons/fi"
import "@/infrastructure/css/usuario/metodospago/MetodoCard.css"

export function MetodoCard({ metodo: m }) {
  return (
    <div className="mp-card" style={{ "--acento": m.acento, "--acento-claro": m.acentoClaro }}>
      <div className="mp-card-bar" />
      <div className="mp-card-inner">
        <div className="mp-card-header">
          <div className="mp-card-icono">
            <m.Icon size={28} color={m.acento} />
          </div>
          <span className="mp-card-tag" style={{ background: m.acentoClaro, color: m.acento }}>
            {m.tag}
          </span>
        </div>

        <h2 className="mp-card-titulo">{m.titulo}</h2>
        <p className="mp-card-desc">{m.descripcion}</p>

        <div className="mp-pasos">
          {m.pasos.map((paso, i) => (
            <div key={i} className="mp-paso">
              <span className="mp-paso-num" style={{ background: m.acento }}>{i + 1}</span>
              <span className="mp-paso-texto">{paso}</span>
              {i < m.pasos.length - 1 && <FiArrowRight size={12} className="mp-paso-arrow" />}
            </div>
          ))}
        </div>

        <div className="mp-card-footer">
          <div className="mp-disponible" style={{ color: m.acento }}>
            <span className="mp-dot" style={{ background: m.acento }} />
            Disponible ahora
          </div>
        </div>
      </div>
    </div>
  )
}