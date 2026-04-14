import { Router } from 'express'
import { listarNotificaciones, marcarLeida, marcarTodasLeidas } from '../controllers/notificacion.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/notificaciones',            verificarToken, listarNotificaciones)
router.put('/api/notificaciones/leer-todas', verificarToken, marcarTodasLeidas)
router.put('/api/notificaciones/:id/leer',   verificarToken, marcarLeida)

export default router