import { Route } from "react-router-dom";
import MainLayout from "@/core/layout/MainLayout";
import ProtectedAdmin from "./components/ProtectedAdmin";
import UserManagement from "./pages/UserManagement";
import RoleAssignment from "./pages/RoleAssignment";
import AdministradorDash from "./pages/AdministradorDash";
import AuditLog from "./pages/AuditLog";
import Adminproductos from "./pages/AdminProductos";
import Adminpedidos from "./pages/AdminPedidos";
import Adminresenas from "./pages/AdminResenas";
import Admindestacados from "./pages/AdminDestacados";
import Admincupones from "./pages/AdminCupones";
import Adminalianzas from "./pages/AdminAlianzas";
import AuditoriaInventario from "@/features/admin/pages/AuditoriaInventario"
import Notificaciones from "@/features/usuario/pages/Notificaciones"
import PerfilForm from "@/features/shared/components/PerfilForm"
import MetodosPagoAdmin from "./pages/MetodosPagoAdmin"
import AdminPagos from "./pages/AdminPagos"
import AdminLiquidaciones from "./pages/AdminLiquidaciones"
import AdminFacturas from "./pages/AdminFacturas"

export const AdminRoutes = (
  <Route element={<MainLayout />}>
    <Route element={<ProtectedAdmin />}>
      <Route path="/admin"              element={<AdministradorDash />} />
      <Route path="/admin/users"        element={<UserManagement />} />
      <Route path="/admin/roles"        element={<RoleAssignment />} />
      <Route path="/admin/logs"         element={<AuditLog />} />
      <Route path="/admin/productos"    element={<Adminproductos />} />
      <Route path="/admin/pedidos"      element={<Adminpedidos />} />
      <Route path="/admin/metodos-pago" element={<MetodosPagoAdmin />} />
      <Route path="/admin/pagos" element={<AdminPagos />} />
      <Route path="/admin/resenas"      element={<Adminresenas />} />
      <Route path="/admin/destacados"   element={<Admindestacados />} />
      <Route path="/admin/cupones"      element={<Admincupones />} />
      <Route path="/admin/alianzas"     element={<Adminalianzas />} />
      <Route path="/notificaciones-admin" element={<Notificaciones />} />
      <Route path="/admin/inventario" element={<AuditoriaInventario />} />
      <Route path="/admin/perfil" element={<PerfilForm />} />
      <Route path="/admin/liquidaciones" element={<AdminLiquidaciones />} />
      <Route path="/admin/facturas" element={<AdminFacturas />} />
    </Route>
  </Route>
)