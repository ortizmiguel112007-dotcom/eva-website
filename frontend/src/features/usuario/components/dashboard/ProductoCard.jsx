import { FiPackage } from "react-icons/fi"
import { formatPrecio } from "@/features/tienda/utils/utils"
import { BtnAgregar } from "@/features/tienda/components/shared/BtnAgregar"
import "@/infrastructure/css/usuario/dashboard/loading/ProductoCard.css"

export function ProductoCard({ producto: p, onNavigate, onAgregar }) {
  const agotado = p.inventario?.cantidad === 0

  return (
    <div className="ud-card">
      <div className="ud-card-img" onClick={() => onNavigate(p.id_producto)}>
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre_producto} />
          : <div className="ud-card-placeholder"><FiPackage size={32} color="#94a3b8" /></div>
        }
        <span className="ud-badge">{p.tipo === "producto" ? "Producto" : "Servicio"}</span>
        {agotado && <div className="ud-agotado">Agotado</div>}
      </div>
      <div className="ud-card-body">
        <h3>{p.nombre_producto}</h3>
        <span className="ud-precio">{formatPrecio(p.precio)}</span>
        <span className={agotado ? "ud-agotado-label" : "ud-disponible"}>
          {agotado ? "No disponible" : "Disponible"}
        </span>
        <BtnAgregar
          agotado={agotado}
          tipo={p.tipo}
          className="ud-btn-agregar"
          onClick={() => onAgregar(p)}
        />
      </div>
    </div>
  )
}