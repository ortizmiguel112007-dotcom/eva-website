import { Router } from 'express'
import { CreaterDate,obtenerPerfil, actualizarPerfil } from '../controllers/usuario.controller.js'
import { verificarCodigo } from '../controllers/verificar.codigo.js'
import { Login } from '../controllers/usuario.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()
router.post('/registro', CreaterDate)
router.post('/verificar', verificarCodigo)
router.post('/login', Login)
router.get('/api/perfil', verificarToken, obtenerPerfil)
router.put('/api/perfil', verificarToken, actualizarPerfil)

export default router