import { Route } from "react-router-dom"
import MainLayout from "@/core/layout/MainLayout"
import PerfilTienda from "./pages/PerfilTienda"
import Inicio from "./pages/Inicio"
import Catalogo from "./pages/Catalogo"
import Tiendas from "./pages/Tiendas"
import DetalleProducto from "./pages/Detalleproducto"
import Carrito from "./pages/Carrito"
import TiendaAlianza from "./pages/TiendaAlianza"

export const TiendaRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/"          element={<Inicio />} />
    <Route path="/catalogo" element={<Catalogo />} />
    <Route path="/tiendas"   element={<Tiendas />} />
    <Route path="/tienda/:id_emprendedora" element={<PerfilTienda />} />
    <Route path="/producto-detalle/:id" element={<DetalleProducto />} />
    <Route path="/carrito" element={<Carrito />} />
    <Route path="/alianza/:id_alianza" element={<TiendaAlianza />} />
  </Route>
)