/**
 * ---------------------------------------------------------
 * Archivo: main.jsx (o index.jsx)
 * Descripción:
 * Punto de entrada de la aplicación React.
 * Aquí se monta el componente principal dentro del DOM.
 * ---------------------------------------------------------
 */

// Importaciones
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App.jsx'

// Seleccionamos el elemento del DOM donde se montará la aplicación React y renderizamos el componente principal (App) dentro de él.
createRoot(document.getElementById('root')).render(

  // StrictMode envuelve la aplicación para ayudar
  // a detectar prácticas inseguras o código obsoleto.
  <StrictMode>

    {/* Componente principal que representa toda la aplicación */}
    <App />
  </StrictMode>,
)