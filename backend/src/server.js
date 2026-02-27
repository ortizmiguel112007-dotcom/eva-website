// server.js
import express from 'express'
import prisma from './conexion.js'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/usuarios', async (req, res) => {
  const usuarios = await prisma.user.findMany()
  res.json(usuarios)
})

app.listen(3000, () => {
  console.log('<Servidor corriendo en http://localhost:3000>')
})