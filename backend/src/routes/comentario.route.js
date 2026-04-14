import { Router } from 'express'
import { listarComentarios, crearComentario, ocultarComentario,listarComentariosPorProducto,listarTodosComentariosAdmin } from '../controllers/comentario.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/comentarios',               verificarToken, listarComentarios)
router.post('/api/comentarios',              verificarToken, crearComentario)
router.put('/api/comentarios/:id/ocultar',   verificarToken, ocultarComentario)
router.get('/api/comentarios/producto/:id', listarComentariosPorProducto)
router.get('/api/admin/comentarios', verificarToken, listarTodosComentariosAdmin)
export default router