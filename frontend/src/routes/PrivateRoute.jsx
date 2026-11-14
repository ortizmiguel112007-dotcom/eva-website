/**
 * ---------------------------------------------------------
 * Archivo: PrivateRoute.jsx
 * Descripción:
 * Componente de protección de rutas.
 * Restringe acceso según autenticación y rol.
 * ---------------------------------------------------------
 */

// Importaciones
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/core/context/AuthConten";

const PrivateRoute = ({ rolRequerido }) => {
  const { user } = useAuth();

  console.log("Rol del usuario:", user?.rol);
  console.log("Rol requerido:", rolRequerido);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Rol incorrecto: al inicio único, que se adapta al rol
  if (rolRequerido && user.rol !== rolRequerido) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
