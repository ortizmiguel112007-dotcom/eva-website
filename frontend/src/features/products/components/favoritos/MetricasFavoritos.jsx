import { FiHeart, FiPackage, FiTrendingUp } from "react-icons/fi"
import "@/infrastructure/css/products-emprend/favoritos_tiendas/MetricasFavoritos.css"

export function MetricasFavoritos({ productos }) {
  const totalFavoritos = productos.reduce((acc, p) => acc + (p.total_favoritos || 0), 0)
  const masPopular     = productos.reduce((max, p) =>
    (p.total_favoritos || 0) > (max?.total_favoritos || 0) ? p : max, null)

  return (
    <div className="ft-metricas">
      <div className="ft-metrica">
        <div className="ft-metrica-icono" style={{ background: "#fff1f2" }}>
          <FiHeart size={16} color="#ef4444" fill="#ef4444" />
        </div>
        <div>
          <p className="ft-metrica-label">Total favoritos</p>
          <strong className="ft-metrica-valor" style={{ color: "#ef4444" }}>{totalFavoritos}</strong>
        </div>
      </div>

      <div className="ft-metrica">
        <div className="ft-metrica-icono" style={{ background: "#eff6ff" }}>
          <FiPackage size={16} color="#3b82f6" />
        </div>
        <div>
          <p className="ft-metrica-label">Productos guardados</p>
          <strong className="ft-metrica-valor" style={{ color: "#3b82f6" }}>{productos.length}</strong>
        </div>
      </div>

      {masPopular && (
        <div className="ft-metrica ft-metrica--wide">
          <div className="ft-metrica-icono" style={{ background: "#fffbeb" }}>
            <FiTrendingUp size={16} color="#f59e0b" />
          </div>
          <div>
            <p className="ft-metrica-label">Más popular</p>
            <strong className="ft-metrica-valor" style={{ color: "#f59e0b", fontSize: "0.88rem" }}>
              {masPopular.nombre_producto}
            </strong>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              {masPopular.total_favoritos} ♥
            </span>
          </div>
        </div>
      )}
    </div>
  )
}