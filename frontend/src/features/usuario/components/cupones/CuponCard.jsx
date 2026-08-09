import { FiClock, FiCheck, FiCopy } from "react-icons/fi"
import { formatPrecio, formatFecha } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/usuario/cupones/CuponCard.css"

const COLORES = [
  { bg: "#eef2ff", acento: "#6366f1", borde: "#c7d2fe" },
  { bg: "#ecfdf5", acento: "#10b981", borde: "#6ee7b7" },
  { bg: "#fff7ed", acento: "#f97316", borde: "#fed7aa" },
  { bg: "#fdf4ff", acento: "#a855f7", borde: "#e9d5ff" },
  { bg: "#fffbeb", acento: "#f59e0b", borde: "#fde68a" },
]

export function CuponCard({ cupon: c, idx, copiado, onCopiar }) {
  const col     = COLORES[idx % COLORES.length]
  const vencido = c.fecha_fin && new Date(c.fecha_fin) < new Date()
  const yaCopiado = copiado === c.codigo

  return (
    <div className={`mc-card ${vencido ? "vencido" : ""}`}
      style={{ "--col-bg": col.bg, "--col-acento": col.acento, "--col-borde": col.borde }}>

      <div className="mc-card-cut left" />
      <div className="mc-card-cut right" />

      <div className="mc-card-top">
        <div className="mc-card-descuento" style={{ color: col.acento }}>
          {c.tipo === "porcentaje"
            ? <><span className="mc-card-valor">{c.valor}</span><span className="mc-card-pct">% OFF</span></>
            : <><span className="mc-card-valor" style={{ fontSize: "1.4rem" }}>{formatPrecio(c.valor)}</span><span className="mc-card-pct">OFF</span></>
          }
        </div>
        {vencido
          ? <span className="mc-card-tag vencido">Expirado</span>
          : <span className="mc-card-tag activo" style={{ background: col.acento }}>Activo</span>
        }
      </div>

      <div className="mc-card-divider" />

      <div className="mc-card-bottom">
        <div className="mc-card-codigo-wrap">
          <span className="mc-card-codigo">{c.codigo}</span>
          <button className="mc-card-copiar"
            onClick={() => onCopiar(c.codigo)}
            style={{ color: yaCopiado ? col.acento : "#94a3b8" }}
            title="Copiar código">
            {yaCopiado ? <FiCheck size={13} /> : <FiCopy size={13} />}
          </button>
        </div>
        {c.descripcion && <p className="mc-card-desc">{c.descripcion}</p>}
        <div className="mc-card-info">
          <span><FiClock size={10} /> {vencido ? "Expirado" : `Vence: ${formatFecha(c.fecha_fin)}`}</span>
          {c.limite_usos && <span>{c.usos}/{c.limite_usos} usos</span>}
        </div>
      </div>
    </div>
  )
}