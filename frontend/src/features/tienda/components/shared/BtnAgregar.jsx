
import { FiShoppingCart, FiCheck } from "react-icons/fi";

export function BtnAgregar({
  agregado,
  agotado,
  tipo,
  onClick,
  className = "dp-btn-agregar",
}) {
  let contenido;

  if (agotado) {
    contenido = "Agotado";
  } else if (agregado) {
    contenido = (
      <>
        <FiCheck size={13} />
        <span>Listo</span>
      </>
    );
  } else if (tipo === "servicio") {
    contenido = (
      <>
        <FiShoppingCart size={13} />
        <span>Reservar</span>
      </>
    );
  } else {
    contenido = (
      <>
        <FiShoppingCart size={13} />
        <span>Agregar</span>
      </>
    );
  }

  return (
    <button
      type="button"
      className={`${className} ${agregado ? "agregado" : ""} ${agotado ? "agotado" : ""}`}
      onClick={onClick}
      disabled={agotado}
    >
      {contenido}
    </button>
  );
}
