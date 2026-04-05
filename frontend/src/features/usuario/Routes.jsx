import { Route } from "react-router-dom"
import MainLayout from "@/core/layout/MainLayout"
import PrivateRoute from "@/routes/PrivateRoute"
import UsuarioDashboard       from "./pages/UsuarioDashboard"
import MisPedidos             from "./pages/MisPedidos"
import PerfilUsuario          from "./pages/PerfilUsuario"
import SeguimientoPedidos     from "./pages/SeguimientoPedidos"
import CatalogoUsuario        from "./pages/CatalogoUsuario"
import DetalleProductoUsuario from "./pages/Detalleproductousuario"
import MetodosPago            from "./pages/MetodosPago"
import HistorialPagos         from "./pages/HistorialPagos"
import MisResenas             from "./pages/MisResenas"
import MisCupones             from "./pages/MisCupones"
import DestacadosUsuario      from "./pages/DestacadosUsuario"
import MisFacturas            from "./pages/MisFacturas"
 
export const UsuarioRoutes = (
  <Route element={<MainLayout />}>
    <Route element={<PrivateRoute rolRequerido="usuario" />}>
      <Route path="/inicio"          element={<UsuarioDashboard />} />
      <Route path="/productos"       element={<CatalogoUsuario />} />
      <Route path="/producto/:id"    element={<DetalleProductoUsuario />} />
      <Route path="/mis-pedidos"     element={<MisPedidos />} />
      <Route path="/seguimiento"     element={<SeguimientoPedidos />} />
      <Route path="/perfil"          element={<PerfilUsuario />} />
      <Route path="/metodos-pago"    element={<MetodosPago />} />
      <Route path="/historial-pagos" element={<HistorialPagos />} />
      <Route path="/mis-resenas"     element={<MisResenas />} />
      <Route path="/mis-cupones"     element={<MisCupones />} />
      <Route path="/destacados-pub"  element={<DestacadosUsuario />} />
      <Route path="/mis-facturas"    element={<MisFacturas />} />
    </Route>
  </Route>
)