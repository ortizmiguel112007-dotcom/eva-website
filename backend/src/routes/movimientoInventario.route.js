import { Router } from 'express'
import { listarMovimientos } from '../controllers/movimientoInventario.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/movimientos/:id_producto', verificarToken, listarMovimientos)

export default router