import { Router } from 'express'
import { listarCupones, crearCupon, toggleCupon, eliminarCupon, validarCupon } from '../controllers/cupon.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/cupones',              verificarToken, listarCupones)
router.post('/api/cupones',             verificarToken, crearCupon)
router.put('/api/cupones/:id/toggle',   verificarToken, toggleCupon)
router.delete('/api/cupones/:id',       verificarToken, eliminarCupon)
router.post('/api/cupones/validar',     verificarToken, validarCupon)

export default router