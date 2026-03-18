import { Router } from 'express'
import { listarPedidos, cambiarEstadoPedido, obtenerPedido } from '../controllers/pedido.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/pedidos',           verificarToken, listarPedidos)
router.get('/api/pedidos/:id',       verificarToken, obtenerPedido)
router.put('/api/pedidos/:id/estado',verificarToken, cambiarEstadoPedido)

export default router