📌 Tipo de Arquitectura

Arquitectura Feature-Based (Modular por Funcionalidades).

Esta arquitectura organiza el proyecto por dominios funcionales en lugar de por tipo de archivo.

Objetivos

Escalabilidad

Separación de responsabilidades

Bajo acoplamiento

Mantenimiento sencillo

Trabajo en equipo organizado

📁 Estructura General
src/
├── main.jsx
├── App.jsx
│
├── routes/
│   └── index.jsx
│
├── core/
│   ├── layout/
│   └── providers/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── cart/
│   └── dashboard/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── assets/
└── styles/
📍 Descripción de Carpetas
main.jsx
Responsabilidad

Punto de entrada de la aplicación.

Monta React en el DOM.

Envuelve la aplicación con:

BrowserRouter

AppProvider

StrictMode

Regla

No debe contener lógica de negocio.

App.jsx
Responsabilidad

Componente raíz.

Renderiza el sistema de rutas.

Ejemplo conceptual:

<AppRouter />

No debe contener lógica compleja.

routes/

Contiene la configuración central de rutas.

routes/
└── index.jsx
Responsabilidad

Definir rutas públicas y privadas.

Asociar rutas con páginas.

Integrar el layout principal.

Regla

No debe contener lógica de negocio.

core/

Contiene infraestructura global de la aplicación.

No incluye funcionalidades específicas como productos o usuarios.

core/layout/

Contiene la estructura visual global.

Ejemplos:

MainLayout.jsx

Sidebar.jsx

Header.jsx

Responsabilidad

Definir la estructura base.

Renderizar <Outlet /> para mostrar páginas dinámicas.

core/providers/

Contiene configuraciones globales.

Ejemplos:

React Query Provider

Context global

Configuración de estado

Configuración de tema

Responsabilidad

Envolver la aplicación con librerías necesarias.

features/

Es el núcleo funcional del sistema.

Cada carpeta representa una funcionalidad independiente.

Ejemplo:

features/
  products/
  users/
  auth/
  cart/

Cada feature es autocontenida.

📂 Estructura Interna de una Feature

Ejemplo: products

products/
├── pages/
├── components/
├── services/
├── hooks/
└── index.js
pages/

Contiene páginas asociadas a rutas.

Ejemplos:

ProductsPage.jsx

ProductDetailPage.jsx

Responsabilidad

Composición visual y conexión con hooks.

components/

Componentes internos exclusivos de la feature.

Ejemplos:

ProductCard.jsx

ProductForm.jsx

No deben utilizarse fuera de la feature.

services/

Encargado de la comunicación con el backend.

Ejemplo:

productService.js

Responsabilidad

Llamadas HTTP

Transformación de datos externos

Regla:
Los componentes no deben llamar directamente a axios.

hooks/

Contiene lógica reutilizable de la feature.

Ejemplos:

useProducts.js

useCreateProduct.js

Responsabilidad

Manejar estado

Conectar servicios con la UI

shared/

Contiene elementos reutilizables en múltiples features.

shared/
├── components/
├── hooks/
├── utils/
└── constants/
shared/components/

Componentes genéricos reutilizables.

Ejemplos:

Button.jsx

Input.jsx

Modal.jsx

No deben depender de ninguna feature específica.

shared/hooks/

Hooks reutilizables globales.

Ejemplos:

useDebounce

useLocalStorage

shared/utils/

Funciones auxiliares.

Ejemplos:

formatCurrency

formatDate

assets/

Contiene:

Imágenes

Iconos

Fuentes

No debe contener lógica.

styles/

Contiene:

Estilos globales

Variables CSS

Configuración de Tailwind (si aplica)

📐 Reglas de Arquitectura

Las features no deben depender entre sí directamente.

Shared no debe importar desde features.

Core no debe contener lógica de negocio.

Las llamadas HTTP solo se realizan desde services.

Los componentes no deben llamar directamente a axios.

Las páginas deben usar hooks para lógica.

Cada feature debe ser independiente y autocontenida.

🔄 Flujo Interno de Datos

Ejemplo: Obtener productos

ProductsPage
↓
useProducts()
↓
productService.getProducts()
↓
HTTP Client
↓
Backend

Respuesta:

Backend
↓
Service
↓
Hook
↓
Componente

📈 Ventajas para Proyecto Grande

Escalable

Mantenible

Bajo acoplamiento

Organización clara por dominio

Facilita trabajo en equipo

Reduce conflictos en Git

🧠 Tipo de Arquitectura

Esta arquitectura es:

Arquitectura modular por dominio funcional adaptada a frontend.

No es arquitectura hexagonal pura (esa se usa principalmente en backend).

✅ Conclusión

Esta arquitectura es adecuada para:

E-commerce

SaaS

Plataformas empresariales

Aplicaciones grandes

Permite crecer sin necesidad de reestructurar el proyecto en el futuro.