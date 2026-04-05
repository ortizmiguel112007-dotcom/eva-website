import { Router } from 'express'
import {
  getCarrito,
  agregarItem,
  actualizarItem,
  eliminarItem,
  vaciarCarrito
} from '../controllers/carrito.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/carrito',              verificarToken, getCarrito)
router.post('/api/carrito/items',       verificarToken, agregarItem)
router.put('/api/carrito/items/:id',    verificarToken, actualizarItem)
router.delete('/api/carrito/items/:id', verificarToken, eliminarItem)
router.delete('/api/carrito',           verificarToken, vaciarCarrito)

export default router