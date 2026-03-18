import { Router } from 'express'
import { listarComentarios, crearComentario, ocultarComentario } from '../controllers/comentario.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/comentarios',               verificarToken, listarComentarios)
router.post('/api/comentarios',              verificarToken, crearComentario)
router.put('/api/comentarios/:id/ocultar',   verificarToken, ocultarComentario)

export default router