import { Route } from "react-router-dom";
import MainLayout from "@/core/layout/MainLayout";
import ProductsDashboard from "./pages/ProductsDashboard";
import CreateItemForm from "./components/estructura/Createitemform";
import EditItem from "./pages/Edititem";
import CreateItem from "./pages/CreateItem";
import Inventario from "./pages/Inventario";
import Pedidos from "./pages/Pedidos";
import Perfil from "./pages/Perfil";
import Alianzas from "./pages/Alianzas";
import Destacados from "./pages/Destacados";
import Cupones from "./pages/Cupones";
import Comentarios from "./pages/Comentarios";

export const ProductosRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/dashboard" element={<ProductsDashboard />} />
    <Route path="/crear-item" element={<CreateItem />} />
    <Route path="/crear-producto" element={<CreateItemForm type="product" />} />
    <Route path="/crear-servicio" element={<CreateItemForm type="service" />} />
    <Route path="/editar/producto/:id" element={<EditItem type="product" />} />
    <Route path="/editar/servicio/:id" element={<EditItem type="service" />} />
    <Route path="/inventario" element={<Inventario />} />
    <Route path="/alianzas" element={<Alianzas />} />
    <Route path="/pedidos" element={<Pedidos />} />
    <Route path="/perfil" element={<Perfil />} />
    <Route path="/destacados" element={<Destacados />} />
    <Route path="/cupones" element={<Cupones />} />
    <Route path="/comentarios" element={<Comentarios />} />
  </Route>
);
