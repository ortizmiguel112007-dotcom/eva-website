import { Router } from 'express'
import {
  listarAlianzas,
  crearAlianza,
  autorizarAlianza,
  finalizarAlianza,
  listarEmprendedoras
} from '../controllers/alianza.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/alianzas',                  verificarToken, listarAlianzas)
router.get('/api/alianzas/emprendedoras',    verificarToken, listarEmprendedoras)
router.post('/api/alianzas',                 verificarToken, crearAlianza)
router.put('/api/alianzas/:id/autorizar',    verificarToken, autorizarAlianza)
router.put('/api/alianzas/:id/finalizar',    verificarToken, finalizarAlianza)

export default router