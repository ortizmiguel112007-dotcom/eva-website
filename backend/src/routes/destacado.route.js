import { Router } from 'express'
import {
  listarDestacados, solicitarDestacado, listarDestacadosPublico, registrarEvento,
  aprobarDestacado, rechazarDestacado, desactivarDestacado, listarDestacadosAdmin,
  obtenerConfigDestacados, actualizarConfigDestacados, historialDestacado,
  metricasEmprendedora, metricasAdmin, exportarMetricas,
} from '../controllers/destacado.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'
import { verificarRol } from '../middleware/verificarRol.middleware.js'

const router = Router()

// Público (RF-076/RF-081) — sin auth
router.get('/api/destacados/publico', listarDestacadosPublico)
router.post('/api/destacados/:id/evento', registrarEvento)

// Emprendedora
router.get('/api/destacados', verificarToken, listarDestacados)
router.post('/api/destacados/:id/solicitar', verificarToken, solicitarDestacado)
router.get('/api/emprendedora/destacados/metricas', verificarToken, metricasEmprendedora)

// Admin
router.get('/api/admin/destacados', verificarToken, verificarRol('admin'), listarDestacadosAdmin)
router.put('/api/admin/destacados/:id/aprobar', verificarToken, verificarRol('admin'), aprobarDestacado)
router.put('/api/admin/destacados/:id/rechazar', verificarToken, verificarRol('admin'), rechazarDestacado)
router.put('/api/admin/destacados/:id/desactivar', verificarToken, verificarRol('admin'), desactivarDestacado)
router.get('/api/admin/destacados/:id/historial', verificarToken, verificarRol('admin'), historialDestacado)
router.get('/api/admin/destacados/config', verificarToken, verificarRol('admin'), obtenerConfigDestacados)
router.put('/api/admin/destacados/config', verificarToken, verificarRol('admin'), actualizarConfigDestacados)
router.get('/api/admin/destacados/metricas', verificarToken, verificarRol('admin'), metricasAdmin)
router.get('/api/admin/destacados/metricas/export', verificarToken, verificarRol('admin'), exportarMetricas)

export default router