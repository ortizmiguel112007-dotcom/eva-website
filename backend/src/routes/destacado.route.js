import { Router } from 'express'
import { listarDestacados, toggleDestacado } from '../controllers/destacado.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/destacados',      verificarToken, listarDestacados)
router.put('/api/destacados/:id',  verificarToken, toggleDestacado)

export default router