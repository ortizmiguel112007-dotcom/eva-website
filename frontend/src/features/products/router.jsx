import { Route } from "react-router-dom";
import MainLayout from "@/core/layout/MainLayout";
import PrivateRoute from "@/routes/PrivateRoute";
import GestionCitas from "@/features/agenda/pages/GestionCitas";

import ProductsDashboard from "./pages/ProductsDashboard";
import CreateItemForm from "./components/form/CreateItemForm"; // ← ruta actualizada
import EditItem from "./pages/Edititem";
import CreateItem from "./pages/CreateItem";
import Inventario from "./pages/Inventario";
import Pedidos from "./pages/Pedidos";
import Perfil from "./pages/Perfil";
import Alianzas from "./pages/Alianzas";
import Destacados from "./pages/Destacados";
import Cupones from "./pages/Cupones";
import Comentarios from "./pages/Comentarios";
import Pagos from "./pages/Pagos";
import FavoritosTienda from "./pages/FavoritosTienda";
import ReglaDescuento from "./pages/ReglaDescuento";
import Notificaciones from "@/features/usuario/pages/Notificaciones"; // reutilizado
import MetodosPagoConfig from "@/features/products/pages/MetodosPagoConfig";
import Liquidaciones from "./pages/Liquidaciones";
import Disponibilidad from "@/features/agenda/pages/Disponibilidad";
import Facturas from "./pages/Facturas";
export const ProductosRoutes = (
  <Route element={<MainLayout />}>
    <Route element={<PrivateRoute rolRequerido="emprendedora" />}>
      <Route path="/dashboard" element={<ProductsDashboard />} />
      <Route path="/crear-item" element={<CreateItem />} />
      <Route
        path="/crear-producto"
        element={<CreateItemForm type="product" />}
      />
      <Route
        path="/crear-servicio"
        element={<CreateItemForm type="service" />}
      />
      <Route
        path="/editar/producto/:id"
        element={<EditItem type="product" />}
      />
      <Route
        path="/editar/servicio/:id"
        element={<EditItem type="service" />}
      />
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/alianzas" element={<Alianzas />} />
      <Route path="/pedidos" element={<Pedidos />} />
      <Route path="/mi-perfil" element={<Perfil />} />
      <Route path="/destacados" element={<Destacados />} />
      <Route path="/cupones" element={<Cupones />} />
      <Route path="/comentarios" element={<Comentarios />} />
      <Route path="/pagos" element={<Pagos />} />
      <Route path="/reglas-descuento" element={<ReglaDescuento />} />
      <Route path="/notificaciones-emp" element={<Notificaciones />} />
      <Route path="/favoritos-tienda" element={<FavoritosTienda />} />
      <Route path="/metodos-pago-config" element={<MetodosPagoConfig />} />
      <Route path="/liquidaciones" element={<Liquidaciones />} />
      <Route path="/facturas" element={<Facturas />} />
      <Route path="/gestion-citas" element={<GestionCitas />} />
      <Route path="/disponibilidad" element={<Disponibilidad />} />
    </Route>
  </Route>
);
