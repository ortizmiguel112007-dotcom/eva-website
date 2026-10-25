import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import usuariosRoutes     from './routes/usuario.route.js'
import adminRoutes        from './routes/admin.route.js'
import productoRoutes     from './routes/producto.route.js'
import emprendedoraRoutes from './routes/emprendedora.route.js'
import inventarioRouter   from './routes/inventario.route.js'
import pedidoRouter       from './routes/pedido.route.js'
import alianzaRouter      from './routes/alianza.route.js'
import destacadoRouter    from './routes/destacado.route.js'
import cuponRouter        from './routes/cupon.route.js'
import comentarioRouter   from './routes/comentario.route.js'
import publicoRouter      from './routes/publico.route.js'
import carritoRouter from './routes/carrito.route.js'
import pagoRouter from './routes/pago.route.js'
import notificacionRoutes from './routes/notificacion.routes.js'
import favoritoRoutes from './routes/favorito.routes.js'
import reglaDescuentoRouter from './routes/regladescuento.route.js'
import movimientoRouter from './routes/movimientoInventario.route.js'
import metodosPagoRouter from "./routes/metodosPago.route.js"
import liquidacionRoutes from './routes/liquidacion.route.js'
import facturaRoutes from './routes/factura.route.js'
import reporteRoutes from './routes/reporte.route.js'

import googleRoutes from './services/google/google.router.js'

import { actualizarCategoriasAutomaticas } from './controllers/destacado.controller.js'
import { vencerAlianzasExpiradas } from './controllers/alianza.controller.js'
import prisma from './conexion.js'
import { actualizarEstadoCupones } from './controllers/cupon.controller.js'
import agendaRoutes from "./routes/agenda.routes.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// Limpieza de verificaciones expiradas cada 5 min
setInterval(async () => {
  const Borrados = await prisma.verificacionPendiente.deleteMany({
    where: { expiracion: { lt: new Date() } }
  })
  if (Borrados.count > 0) console.log(`Eliminados ${Borrados.count} códigos expirados`)
}, 5 * 60 * 1000)

const app = express()

// Configuración de CORS dinámica (Local + Producción)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.VITE_API_URL,
].filter(Boolean) // Elimina valores undefined si no está definida la variable

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json())
app.use('/uploads', express.static(join(__dirname, '../../uploads')))

// ── Rutas sin prefijo adicional ────────────────────────────
// Los routers ya traen sus prefijos internamente (/api/...) 
app.use(usuariosRoutes)       // /registro, /verificar, /login, /api/perfil
app.use(adminRoutes)          // /admin/usuarios, /admin/auditoria
app.use('/api/items', productoRoutes)          // /api/items/...
app.use('/api/emprendedora', emprendedoraRoutes) // /api/emprendedora/mi-seccion
app.use(inventarioRouter)     // /api/inventario, /api/inventario/:id
app.use(pedidoRouter)         // /api/pedidos, /api/cliente/pedidos
app.use(alianzaRouter)        // /api/alianzas
app.use(destacadoRouter)      // /api/destacados
app.use(cuponRouter)          // /api/cupones
app.use(comentarioRouter)     // /api/comentarios
app.use(publicoRouter)        // /api/publico
app.use(carritoRouter)         // /api/carrito, /api/carrito/agregar, /api/carrito/quitar
app.use(pagoRouter)
app.use(notificacionRoutes)   // /api/notificaciones, /api/notificaciones/leer-todas, /api/notificaciones/:id/leer
app.use(favoritoRoutes)       // /api/favoritos, /api/favoritos/:id_producto, /api/favoritos/tienda
app.use(reglaDescuentoRouter) // /api/reglas-descuento
app.use(movimientoRouter)     // /api/movimientos-inventario
app.use(metodosPagoRouter)    // /api/emprendedora/metodos-pago, /api/tienda/:id_emprendedora/metodos-pago
app.use(liquidacionRoutes)
app.use(facturaRoutes)
app.use(googleRoutes)
app.use("/api/agenda", agendaRoutes);

setInterval(vencerAlianzasExpiradas, 30 * 60 * 1000)
vencerAlianzasExpiradas()

app.use(reporteRoutes)
// RF-078/RN-066: recalcula categorías automáticas (ej. "más vendidos") cada 30 min
setInterval(actualizarCategoriasAutomaticas, 30 * 60 * 1000)
actualizarCategoriasAutomaticas() // corre una vez al iniciar el servidor también
setInterval(actualizarEstadoCupones, 15 * 60 * 1000)
actualizarEstadoCupones()

// Puerto dinámico para la nube o 3000 por defecto en local
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
}).on('error', (err) => {
  console.error('Error al iniciar servidor:', err)
})

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err)
})