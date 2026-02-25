# Proyecto E-Commerce

Este proyecto es un sistema de e-commerce tipo Mercado Libre, con frontend en **React + Vite** y backend en **Node.js + Express + PostgreSQL**.

---

## Estructura del Proyecto


mi-proyecto/
├── frontend/ # Aplicación React
├── backend/ # API Node.js + Express
├── .gitignore
├── README.md
└── .env.example # Variables de entorno


---

## Tecnologías

### Frontend
- React 18
- Vite
- React Router
- Axios
- SWC (compilación rápida)

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT para autenticación

---

## Instalación

1. Clonar el repositorio:

```bash
git clone <repo-url>
cd mi-proyecto

Instalar dependencias en frontend y backend:

cd frontend
npm install
cd ../backend
npm install

Configurar variables de entorno (.env) siguiendo .env.example.

Scripts
Frontend
cd frontend
npm run dev      # Levanta el servidor de desarrollo
Backend
cd backend
npm run dev      # Levanta el servidor Express
Raíz (opcional con concurrently)
npm run dev      # Levanta frontend y backend simultáneamente (requiere concurrently)