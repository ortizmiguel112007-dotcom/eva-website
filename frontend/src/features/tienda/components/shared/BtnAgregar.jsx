// tienda/components/shared/BtnAgregar.jsx
import { FiShoppingCart, FiCheck } from "react-icons/fi"

export function BtnAgregar({ agregado, agotado, tipo, onClick, className = "dp-btn-agregar" }) {
  return (
    <button
      className={`${className} ${agregado ? "agregado" : ""} ${agotado ? "agotado" : ""}`}
      onClick={onClick}
      disabled={agotado}
    >
      {agregado      ? <><FiCheck size={13} /> Listo</>
       : agotado     ? "Agotado"
       : tipo === "servicio" ? "Reservar"
       : <><FiShoppingCart size={13} /> Agregar</>}
    </button>
  )
}