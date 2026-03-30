import { Router } from 'express'
import { listarPedidos, cambiarEstadoPedido, obtenerPedido, crearPedido, listarPedidosCliente } from '../controllers/pedido.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/pedidos',           verificarToken, listarPedidos)
router.get('/api/pedidos/:id',       verificarToken, obtenerPedido)
router.put('/api/pedidos/:id/estado',verificarToken, cambiarEstadoPedido)
router.post('/api/cliente/pedidos',  verificarToken, crearPedido)
router.get('/api/cliente/pedidos',   verificarToken, listarPedidosCliente)

export default router