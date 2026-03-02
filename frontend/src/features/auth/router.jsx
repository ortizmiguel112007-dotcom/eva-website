/**
 * ---------------------------------------------------------
 * Archivo: authRoutes.js
 * Descripción:
 * Define las rutas del módulo de autenticación.
 * Todas comparten un layout común (MainLayout).
 * ---------------------------------------------------------
 */

// Importaciones
import { Route } from "react-router-dom";
import MainLayout from "@/core/layout/MainLayout";
import RegisterPage from "./pages/Registre";
import LoginPage from "./pages/Login";
import CrudAdmin from "./pages/Magnate"

/**
 * authRoutes
 * 
 * Grupo de rutas públicas relacionadas con autenticación.
 * Todas las rutas hijas heredan el layout definido en MainLayout.
 */
export const authRoutes = (
    // Rutas públicas de autenticación envueltas en un layout común.
    <Route element={<MainLayout />}>
        {/* Definimos las rutas de registro y login, cada una renderizando su respectiva página. */}
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
    </Route>
);

export const CrudAyuda = (
    <Route element={<MainLayout />}>
        <Route path="/Admincrud" element={<CrudAdmin />} />
    </Route>
);