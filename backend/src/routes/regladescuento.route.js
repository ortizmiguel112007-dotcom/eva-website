import express from 'express'
import { verificarToken } from '../middleware/auth.middleware.js'
import {
  listarReglas,
  crearRegla,
  toggleRegla,
  eliminarRegla,
} from '../controllers/reglasdescuento.controller.js'

const router = express.Router()

router.get('/api/reglas-descuento/:id_producto', verificarToken, listarReglas)
router.post('/api/reglas-descuento',              verificarToken, crearRegla)
router.put('/api/reglas-descuento/:id/toggle',    verificarToken, toggleRegla)
router.delete('/api/reglas-descuento/:id',        verificarToken, eliminarRegla)

export default router