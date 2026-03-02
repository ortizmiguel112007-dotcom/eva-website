import express from 'express'
import cors from 'cors'
import usuariosRoutes from './routes/usuario.route.js'
import adminRoutes    from './routes/admin.route.js'      // ← nuevo
import prisma from './conexion.js'

setInterval(async () => {
  console.log('🔍 Revisando expirados... hora actual:', new Date())
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
  origin: 'http://localhost:5173'
}))
app.use(express.json())

app.use(usuariosRoutes)
app.use(adminRoutes)                                      // ← nuevo

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000')
}).on('error', (err) => {
  console.error('Error:', err)
})

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err)
})