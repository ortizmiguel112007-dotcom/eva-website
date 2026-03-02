import { Router } from 'express'
import {
  GetUsuarios,
  CreateUsuarioAdmin,
  UpdateUsuario,
  ToggleEstadoUsuario,
} from '../controllers/admin.controller.js'

const router = Router()

router.get('/admin/usuarios',                  GetUsuarios)
router.post('/admin/usuarios',                 CreateUsuarioAdmin)
router.put('/admin/usuarios/:id',              UpdateUsuario)
router.patch('/admin/usuarios/:id/estado',     ToggleEstadoUsuario)  // habilitar / inhabilitar

export default router