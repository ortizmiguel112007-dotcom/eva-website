import { Router } from 'express'
import { CreaterDate } from '../controllers/usuario.controller.js'
import { verificarCodigo } from '../controllers/verificar.codigo.js'
import { Login } from '../controllers/usuario.controller.js'

const router = Router()
router.post('/registro', CreaterDate)
router.post('/verificar', verificarCodigo)
router.post('/login', Login)

export default router