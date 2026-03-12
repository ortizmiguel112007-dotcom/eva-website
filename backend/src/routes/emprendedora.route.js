
import { Router } from 'express'
import { getMiSeccion } from '../controllers/emprendedora.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/mi-seccion', verificarToken, getMiSeccion)

export default router