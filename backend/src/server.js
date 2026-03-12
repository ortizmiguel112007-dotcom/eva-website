import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import usuariosRoutes from './routes/usuario.route.js'
import adminRoutes from './routes/admin.route.js'
import productoRoutes from './routes/producto.route.js'
import emprendedoraRoutes from './routes/emprendedora.route.js'
import prisma from './conexion.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

setInterval(async () => {
  console.log('Revisando expirados... hora actual:', new Date())
  const Borrados = await prisma.verificacionPendiente.deleteMany({
    where: { expiracion: { lt: new Date() } }
  })
  console.log(`Registros revisados, borrados: ${Borrados.count}`)
  if (Borrados.count > 0) {
    console.log(`Eliminados ${Borrados.count} códigos expirados`)
  }
}, 5 * 60 * 1000)

const app = express()

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174']
}))

app.use(express.json())
app.use('/uploads', express.static(join(__dirname, '../../uploads')))

app.use(usuariosRoutes)
app.use(adminRoutes)
app.use('/api/items', productoRoutes)
app.use('/api/emprendedora', emprendedoraRoutes)



app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000')
}).on('error', (err) => {
  console.error('Error:', err)
})

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err)
})