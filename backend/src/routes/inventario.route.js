import { Router } from 'express'
import { listarInventario, actualizarStock } from '../controllers/inventario.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/inventario',      verificarToken, listarInventario)
router.put('/api/inventario/:id',  verificarToken, actualizarStock)

export default router