import { Route } from "react-router-dom";
import MainLayout from "@/core/layout/MainLayout";
import Productos from "./pages/product";

export const ProductosRoutes = (
    // Rutas públicas de autenticación envueltas en un layout común.
    <Route element={<MainLayout />}>
        {/* Definimos las rutas de registro y login, cada una renderizando su respectiva página. */}
        <Route path="/productos" element={<Productos />} />
    </Route>
);