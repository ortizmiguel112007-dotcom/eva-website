import { Route } from "react-router-dom"
import MainLayout from "@/core/layout/MainLayout"
import PrivateRoute from "@/routes/PrivateRoute"  // ← agrega
import ProductsDashboard from "./pages/ProductsDashboard"
import CreateItemForm from "./components/estructura/Createitemform"
import EditItem from "./pages/Edititem"
import CreateItem from "./pages/CreateItem"
import Inventario from "./pages/Inventario"
import Pedidos from "./pages/Pedidos"
import Perfil from "./pages/Perfil"
import Alianzas from "./pages/Alianzas"
import Destacados from "./pages/Destacados"
import Cupones from "./pages/Cupones"
import Comentarios from "./pages/Comentarios"
import Pagos from "@/features/products/pages/Pagos"

export const ProductosRoutes = (
  <Route element={<MainLayout />}>
    <Route element={<PrivateRoute rolRequerido="emprendedora" />}>  {/* ← agrega */}
      <Route path="/dashboard" element={<ProductsDashboard />} />
      <Route path="/crear-item" element={<CreateItem />} />
      <Route path="/crear-producto" element={<CreateItemForm type="product" />} />
      <Route path="/crear-servicio" element={<CreateItemForm type="service" />} />
      <Route path="/editar/producto/:id" element={<EditItem type="product" />} />
      <Route path="/editar/servicio/:id" element={<EditItem type="service" />} />
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/alianzas" element={<Alianzas />} />
      <Route path="/pedidos" element={<Pedidos />} />
      <Route path="/mi-perfil" element={<Perfil />} />
      <Route path="/destacados" element={<Destacados />} />
      <Route path="/cupones" element={<Cupones />} />
      <Route path="/comentarios" element={<Comentarios />} />
      <Route path="/pagos" element={<Pagos />} />
    </Route>  {/* ← cierra */}
  </Route>
)