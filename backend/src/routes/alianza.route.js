import { Router } from 'express'
import {
  listarAlianzas, crearAlianza, autorizarAlianza, finalizarAlianza, listarEmprendedoras,
  listarTodasAlianzasAdmin, aprobarAlianzaAdmin, rechazarAlianzaAdmin, desactivarAlianzaAdmin,
  historialAlianza, registrarEventoAlianza, metricasAlianza, exportarMetricasAlianzas,
  obtenerSeccionAlianza, misSeccionesAlianza, tiendaAlianzaPublica, listarAlianzasPublicas,
} from '../controllers/alianza.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'
import { verificarRol } from '../middleware/verificarRol.middleware.js'

const router = Router()

// Público
router.get('/api/publico/alianza/:id', tiendaAlianzaPublica)
router.get('/api/publico/alianzas', listarAlianzasPublicas)
router.post('/api/alianzas/:id/evento', registrarEventoAlianza)

// Emprendedora
router.get('/api/alianzas', verificarToken, listarAlianzas)
router.get('/api/alianzas/emprendedoras', verificarToken, listarEmprendedoras)
router.post('/api/alianzas', verificarToken, verificarRol('emprendedora'), crearAlianza)
router.put('/api/alianzas/:id/autorizar', verificarToken, verificarRol('emprendedora'), autorizarAlianza)
router.put('/api/alianzas/:id/finalizar', verificarToken, verificarRol('emprendedora'), finalizarAlianza)
router.get('/api/alianzas/mis-secciones', verificarToken, misSeccionesAlianza)
router.get('/api/alianzas/:id/seccion', verificarToken, obtenerSeccionAlianza)
router.get('/api/alianzas/:id/metricas', verificarToken, metricasAlianza)

// Admin
router.get('/api/admin/alianzas', verificarToken, verificarRol('admin'), listarTodasAlianzasAdmin)
router.put('/api/admin/alianzas/:id/aprobar', verificarToken, verificarRol('admin'), aprobarAlianzaAdmin)
router.put('/api/admin/alianzas/:id/rechazar', verificarToken, verificarRol('admin'), rechazarAlianzaAdmin)
router.put('/api/admin/alianzas/:id/desactivar', verificarToken, verificarRol('admin'), desactivarAlianzaAdmin)
router.get('/api/admin/alianzas/:id/historial', verificarToken, historialAlianza) // rol validado dentro (admin o participante)
router.get('/api/admin/alianzas/metricas/export', verificarToken, verificarRol('admin'), exportarMetricasAlianzas)

export default router