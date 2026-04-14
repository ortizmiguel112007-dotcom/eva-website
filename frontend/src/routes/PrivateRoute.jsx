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

/**
 * PrivateRoute
 *
 * Responsabilidad:
 * - Validar autenticación.
 * - Validar permisos (rol).
 * - Permitir o bloquear acceso a rutas hijas.
 */

const PrivateRoute = ({ rolRequerido }) => {
  // Simulación de autenticación.
  // En un caso real vendría de:
  // - Context
  // - Redux
  // - Zustand
  // - JWT almacenado
  const { user } = useAuth();

  console.log("Usuario en PrivateRoute:", user); // ← agrega esto
  console.log("Rol del usuario:", user?.rol);
  console.log("Rol requerido:", rolRequerido);
  // Simulación de usuario con rol.
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Validar rol requerido.
    // Rol no coincide
  if (rolRequerido && user.rol !== rolRequerido) {
    // si es emprendedora va a su dashboard
    if (user.rol === "emprendedora") return <Navigate to="/dashboard" />
    // si es admin va a su panel
    if (user.rol === "admin") return <Navigate to="/admin" />
    // cliente va al inicio
    return <Navigate to="/inicio" />
  }

  // Si pasa validaciones, renderizar rutas hijas.
  return <Outlet />;
};

// Exportación del componente.
export default PrivateRoute;
