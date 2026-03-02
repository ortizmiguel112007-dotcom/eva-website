1. Objetivo de la Arquitectura

npx prisma migrate dev --name agregar-password
npx prisma generate
kdxpgixbuifmpsrg

La arquitectura del backend está diseñada bajo un enfoque modular por funcionalidades (feature-based) combinado con separación por capas.

Este diseño permite:

Escalabilidad

Mantenimiento sencillo

Separación clara de responsabilidades

Crecimiento empresarial

Facilidad para agregar nuevas funcionalidades

2. Estructura General del Proyecto
backend/
│
├── src/
│   ├── core/
│   ├── modules/
│   ├── shared/
│   ├── app.js
│   └── server.js
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── package.json
└── README.md
3. Descripción Detallada de Carpetas
3.1 src/core/

Contiene la infraestructura global del sistema.
Aquí se colocan configuraciones y elementos que afectan a toda la aplicación.

Estructura interna:

core/
├── config/
├── database/
└── middlewares/
core/config/
¿Qué va aquí?

Configuración de variables de entorno

Configuración de puerto

Configuración de JWT

Configuración general del sistema

¿Cómo se usa?

Se importa desde cualquier módulo que necesite valores globales.

Ejemplo de uso:

import config from '../core/config/app.config.js'
core/database/
¿Qué va aquí?

Inicialización de conexión a PostgreSQL

Cliente de Prisma

Configuración de base de datos

Si usas Prisma, aquí se exporta el cliente:

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default prisma
¿Cómo se usa?

Los repositories importan el cliente para interactuar con la base de datos.

core/middlewares/
¿Qué va aquí?

Middlewares globales:

Autenticación JWT

Manejo de errores

Validación de datos

Logging

¿Cómo se usa?

Se registran en app.js:

app.use(errorHandler)
app.use(authMiddleware)
3.2 src/modules/

Contiene los módulos del sistema organizados por funcionalidad.

Cada carpeta representa una unidad de negocio independiente.

Ejemplo:

modules/
├── users/
├── auth/
├── products/
├── orders/
└── payments/

Cada módulo tiene la siguiente estructura:

users/
├── user.controller.js
├── user.service.js
├── user.repository.js
├── user.routes.js
└── user.validator.js
user.routes.js
Responsabilidad:

Define las rutas HTTP del módulo.

Uso:

Se importa en app.js:

app.use('/api/users', userRoutes)
user.controller.js
Responsabilidad:

Recibir la petición HTTP y enviar respuesta.

No contiene lógica de negocio compleja.

Ejemplo conceptual:

Llama al servicio

Devuelve JSON

Maneja códigos de estado

user.service.js
Responsabilidad:

Contiene la lógica de negocio.

Aquí se aplican reglas como:

Validaciones adicionales

Transformaciones

Procesamiento de datos

El controller llama al service.

user.repository.js
Responsabilidad:

Comunicación directa con la base de datos.

Aquí se usan consultas con Prisma o SQL.

El service llama al repository.

user.validator.js (opcional pero recomendado)

Contiene validaciones de entrada usando librerías como Joi o Zod.

3.3 src/shared/

Contiene código reutilizable entre módulos.

Estructura:

shared/
├── utils/
└── constants/
shared/utils/

Funciones auxiliares como:

Generar tokens

Hashear contraseñas

Formatear respuestas

Se pueden importar en cualquier módulo.

shared/constants/

Constantes globales:

Roles

Estados

Mensajes estándar

Códigos de error

3.4 app.js

Archivo donde se configura la aplicación Express.

Responsabilidades:

Registrar middlewares

Registrar rutas

Configurar seguridad

Configurar CORS

No inicia el servidor.

3.5 server.js

Punto de entrada principal.

Responsabilidades:

Inicializar conexión a base de datos

Iniciar el servidor

Escuchar el puerto configurado

3.6 prisma/

Contiene la configuración del ORM.

prisma/
└── schema.prisma

Aquí se define:

Modelos de base de datos

Relaciones

Migraciones

Base de datos utilizada: PostgreSQL
Administrable mediante pgAdmin 4.

4. Flujo de una Petición

Ejemplo: Crear usuario

Cliente envía POST /api/users

Ruta dirige al controller

Controller llama al service

Service aplica lógica de negocio

Service llama al repository

Repository consulta la base de datos

Se devuelve respuesta al cliente

Flujo resumido:

Cliente → Routes → Controller → Service → Repository → Database

5. Beneficios de Esta Estructura

Separación clara de responsabilidades

Fácil mantenimiento

Código organizado

Escalable para grandes proyectos

Preparado para crecimiento empresarial