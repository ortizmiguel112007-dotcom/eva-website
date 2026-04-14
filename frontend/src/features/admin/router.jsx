import { Route } from "react-router-dom";
import MainLayout from "@/core/layout/MainLayout";
import ProtectedAdmin from "./components/ProtectedAdmin";
import UserManagement from "./pages/UserManagement";
import RoleAssignment from "./pages/RoleAssignment";
import AdministradorDash from "./pages/AdministradorDash";
import AuditLog from "./pages/AuditLog";
import Adminproductos from "./pages/Adminproductos";
import Adminpedidos from "./pages/Adminpedidos";
import Adminresenas from "./pages/Adminresenas";
import Admindestacados from "./pages/Admindestacados";
import Admincupones from "./pages/Admincupones";
import Adminalianzas from "./pages/Adminalianzas";
import Notificaciones from "@/features/usuario/pages/Notificaciones"

export const AdminRoutes = (
  <Route element={<MainLayout />}>
    <Route element={<ProtectedAdmin />}>
      <Route path="/admin"              element={<AdministradorDash />} />
      <Route path="/admin/users"        element={<UserManagement />} />
      <Route path="/admin/roles"        element={<RoleAssignment />} />
      <Route path="/admin/logs"         element={<AuditLog />} />
      <Route path="/admin/productos"    element={<Adminproductos />} />
      <Route path="/admin/pedidos"      element={<Adminpedidos />} />
      <Route path="/admin/resenas"      element={<Adminresenas />} />
      <Route path="/admin/destacados"   element={<Admindestacados />} />
      <Route path="/admin/cupones"      element={<Admincupones />} />
      <Route path="/admin/alianzas"     element={<Adminalianzas />} />
      <Route path="/notificaciones-admin" element={<Notificaciones />} />
    </Route>
  </Route>
)