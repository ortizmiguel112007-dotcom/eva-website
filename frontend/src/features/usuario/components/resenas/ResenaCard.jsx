import { FiPackage, FiCalendar } from "react-icons/fi"
import { RatingEstrellas } from "@/features/tienda/components/shared/RatingEstrellas"
import { formatFecha } from "@/features/tienda/utils/utils"
import "@/infrastructure/css/usuario/resenas/ResenaCard.css"

const LABEL_CAL = { 5: "Excelente", 4: "Muy bueno", 3: "Bueno", 2: "Regular", 1: "Malo" }

export function ResenaCard({ resena: r }) {
  return (
    <div className="mr-card">
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
        <RatingEstrellas promedio={r.calificacion} size={14} />
      </div>

      <p className="mr-card-texto">"{r.texto}"</p>

      <div className="mr-card-footer">
        <span className="mr-card-tienda">
          {r.pedido?.seccion?.emprendedora?.usuario?.nombre || "EVA"}
        </span>
        <div className={`mr-card-cal cal-${r.calificacion}`}>
          {LABEL_CAL[r.calificacion]}
        </div>
      </div>
    </div>
  )
}