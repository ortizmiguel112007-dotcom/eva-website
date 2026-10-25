import { useNavigate } from "react-router-dom";

/**
 * Lleva al flujo de reserva de citas cuando el artículo es un servicio.
 * Si no hay sesión iniciada, envía primero al login.
 */
export function useReservar() {
  const navigate = useNavigate();

  const irAReservar = (idProducto) => {
    navigate(
      localStorage.getItem("token") ? `/reservar/${idProducto}` : "/login",
    );
  };

  return { irAReservar };
}