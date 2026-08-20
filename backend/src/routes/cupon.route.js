import { Router } from 'express'
import {
  listarCupones, crearCupon, toggleCupon, eliminarCupon, validarCupon,
  listarTodosCuponesAdmin, listarCuponesPublicos, desactivarCuponAdmin,
  metricasCupon, exportarMetricasCupones,
} from '../controllers/cupon.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'
import { verificarRol } from '../middleware/verificarRol.middleware.js'

const router = Router()

router.get('/api/cupones/publicos', verificarToken, listarCuponesPublicos)
router.post('/api/cupones/validar', verificarToken, validarCupon)

router.get('/api/cupones', verificarToken, listarCupones)
router.post('/api/cupones', verificarToken, verificarRol('emprendedora'), crearCupon)
router.put('/api/cupones/:id/toggle', verificarToken, verificarRol('emprendedora'), toggleCupon)
router.delete('/api/cupones/:id', verificarToken, verificarRol('emprendedora'), eliminarCupon)
router.get('/api/cupones/:id/metricas', verificarToken, verificarRol('emprendedora'), metricasCupon)

router.get('/api/admin/cupones', verificarToken, verificarRol('admin'), listarTodosCuponesAdmin)
router.put('/api/admin/cupones/:id/desactivar', verificarToken, verificarRol('admin'), desactivarCuponAdmin)
router.get('/api/admin/cupones/metricas/export', verificarToken, verificarRol('admin'), exportarMetricasCupones)

export default router