// tienda/components/shared/RatingEstrellas.jsx
import { FiStar } from "react-icons/fi"

export function RatingEstrellas({ promedio, total, size = 15 }) {
  if (!promedio) return null
  return (
    <div className="dp-rating">
      <div className="dp-estrellas">
        {[1, 2, 3, 4, 5].map(i => (
          <FiStar key={i} size={size}
            fill={i <= Math.round(Number(promedio)) ? "#f59e0b" : "none"}
            color={i <= Math.round(Number(promedio)) ? "#f59e0b" : "#d1d5db"}
          />
        ))}
      </div>
      <span className="dp-rating-num">{promedio}</span>
      {total && <span className="dp-rating-count">({total} reseñas)</span>}
    </div>
  )
}