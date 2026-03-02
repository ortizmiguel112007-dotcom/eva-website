/**
 * ---------------------------------------------------------
 * Archivo: AppRouter.jsx
 * Descripción:
 * Define la estructura de rutas públicas y privadas
 * de la aplicación usando React Router.
 * ---------------------------------------------------------
 */

// Importaciones
import { Routes, Route } from "react-router-dom";
import { authRoutes, CrudAyuda } from "@/features/auth/router";
import { ProductosRoutes } from "@/features/products/router";
import PrivateRoute from "./PrivateRoute";

// Componente que define las rutas de la aplicación.
const AppRouter = () => {
    return(
        <Routes>
            {/* Rutas publicas */}
            {authRoutes}

            {/* Rutas privadas */}
            <Route element={<PrivateRoute rolRequerido="usuario"/>}>
                {/* Aquí van las rutas que requieren autenticación y permisos. */}
                {ProductosRoutes}
            </Route>

            <Route element={<PrivateRoute rolRequerido="admin"/>}>
                {/* Aquí van las rutas que requieren autenticación y permisos. */}
                {CrudAyuda}
            </Route>
        </Routes>
    )
}

// Exportamos el componente AppRouter para que pueda ser utilizado en otros archivos, como App.jsx.
export default AppRouter