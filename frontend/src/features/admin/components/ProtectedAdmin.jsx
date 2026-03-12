import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthConten";

function ProtectedAdmin() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
 if (user.rol !== "admin") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export default ProtectedAdmin;