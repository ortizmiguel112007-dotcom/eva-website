import { Route } from "react-router-dom";
import MainLayout from "@/core/layout/MainLayout";
import ProductsDashboard from "./pages/ProductsDashboard";
import CreateItem from "./pages/CreateItem";
import CreateProductForm from "./components/estructura/CreateProductForm";
import CreateServiceForm from "./components/estructura/CreateServiceForm";
import CreatePS from "./pages/CreatePS";

export const ProductosRoutes = (
  // Rutas públicas de autenticación envueltas en un layout común.
  <Route element={<MainLayout />}>
    {/* Definimos las rutas de registro y login, cada una renderizando su respectiva página. */}
    <Route path="/dashboard" element={<ProductsDashboard />} />
    <Route path="/crear-item" element={<CreateItem />} />
    <Route path="/crear-producto" element={<CreateProductForm />} />
    <Route path="/crear-servicio" element={<CreateServiceForm />} />
    <Route
      path="/editar/producto/:id"
      element={<CreatePS ps={CreateProductForm} />}
    />
    <Route
      path="/editar/servicio/:id"
      element={<CreatePS ps={CreateServiceForm} />}
    />
  </Route>
);
