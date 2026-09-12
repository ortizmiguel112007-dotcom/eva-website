import { Router } from 'express'
import {
  GetUsuarios, CreateUsuarioAdmin, UpdateUsuario,
  ToggleEstadoUsuario, aprobarEmprendedora, rechazarEmprendedora, cambiarRol, listarAuditoria,
} from '../controllers/admin.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

// Token normaliza "administrador" → "admin"
const soloAdmin = (req, res, next) => {
  if (req.user?.rol !== 'admin') return res.status(403).json({ error: 'No autorizado' })
  next()
}

router.get('/admin/usuarios',              verificarToken, soloAdmin, GetUsuarios)
router.post('/admin/usuarios/create',      verificarToken, soloAdmin, CreateUsuarioAdmin)
router.put('/admin/usuarios/:id',          verificarToken, soloAdmin, UpdateUsuario)
router.patch('/admin/usuarios/:id/estado', verificarToken, soloAdmin, ToggleEstadoUsuario)
router.put('/admin/usuarios/:id/aprobar',  verificarToken, soloAdmin, aprobarEmprendedora)
router.put('/admin/usuarios/:id/rechazar', verificarToken, soloAdmin, rechazarEmprendedora)
router.put('/admin/usuarios/:id/rol',      verificarToken, soloAdmin, cambiarRol)
router.get('/admin/auditoria',             verificarToken, soloAdmin, listarAuditoria)

export default router