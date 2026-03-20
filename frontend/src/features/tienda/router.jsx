import { Route } from "react-router-dom"
import MainLayout from "@/core/layout/MainLayout"
import PerfilTienda from "./pages/PerfilTienda"

export const TiendaRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/tienda/:id_emprendedora" element={<PerfilTienda />} />
  </Route>
)