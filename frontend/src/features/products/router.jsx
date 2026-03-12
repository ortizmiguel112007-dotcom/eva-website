import { Route } from "react-router-dom";
import MainLayout from "@/core/layout/MainLayout";
import ProductsDashboard from "./pages/ProductsDashboard";
import CreateItemForm from "./components/estructura/Createitemform";
import EditItem from "./pages/Edititem";
import CreateItem from "./pages/CreateItem";

export const ProductosRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/dashboard" element={<ProductsDashboard />} />
    <Route path="/crear-item" element={<CreateItem />} /> 
    <Route path="/crear-producto" element={<CreateItemForm type="product" />} />
    <Route path="/crear-servicio" element={<CreateItemForm type="service" />} />
    <Route path="/editar/producto/:id" element={<EditItem type="product" />} />
    <Route path="/editar/servicio/:id" element={<EditItem type="service" />} />
  </Route>
);