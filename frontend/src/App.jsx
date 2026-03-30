/**
 * ---------------------------------------------------------
 * Archivo: App.jsx
 * Descripción:
 * Componente raíz de la aplicación.
 * Configura el sistema de enrutamiento y estilos globales.
 * ---------------------------------------------------------
 */

// Importaciones
import { BrowserRouter } from "react-router-dom";
import AppRouter from "@/routes/Index";
import "@/infrastructure/css/App.css";
import { AuthProvider } from "@/core/context/AuthConten";
import { CarritoProvider } from "@/core/context/CarritoContext";

/**
 * Componente principal de la aplicación.
 *
 * Responsabilidad:
 * - Proveer el contexto de navegación.
 * - Renderizar las rutas definidas en AppRouter.
 */
function App() {
  return (
    // BrowserRouter envuelve la aplicación para
    // habilitar el sistema de navegación.
    <BrowserRouter>
      <AuthProvider>
        {/* Componente que define qué se renderiza según la URL */}
        <CarritoProvider>   {/* ← debe estar DENTRO de AuthProvider */}
          <AppRouter />
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Exportamos el componente App para que pueda ser utilizado en otros archivos, como main.jsx.
export default App;
