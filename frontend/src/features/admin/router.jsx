import { Route } from "react-router-dom";
import MainLayout from "@/core/layout/MainLayout";
import ProtectedAdmin from "./components/ProtectedAdmin";
import UserManagement from "./pages/UserManagement";
import RoleAssignment from "./pages/RoleAssignment";
import AuditLog from "./pages/AuditLog";

export const AdminRoutes = (
  <Route element={<MainLayout />}>
    <Route element={<ProtectedAdmin />}>
      <Route path="/admin"       element={<UserManagement />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/roles" element={<RoleAssignment />} />
      <Route path="/admin/logs"  element={<AuditLog />} />
    </Route>
  </Route>
)