import { Router } from 'express'
import {
  listarAlianzas,
  crearAlianza,
  autorizarAlianza,
  finalizarAlianza,
  listarEmprendedoras,
  listarTodasAlianzasAdmin,
  obtenerSeccionAlianza, 
  misSeccionesAlianza,
  tiendaAlianzaPublica,
  listarAlianzasPublicas
} from '../controllers/alianza.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/alianzas',                  verificarToken, listarAlianzas)
router.get('/api/alianzas/emprendedoras',    verificarToken, listarEmprendedoras)
router.post('/api/alianzas',                 verificarToken, crearAlianza)
router.put('/api/alianzas/:id/autorizar',    verificarToken, autorizarAlianza)
router.put('/api/alianzas/:id/finalizar',    verificarToken, finalizarAlianza)
router.get('/api/admin/alianzas', verificarToken, listarTodasAlianzasAdmin)
router.get('/api/alianzas/mis-secciones', verificarToken, misSeccionesAlianza)
router.get('/api/alianzas/:id/seccion',   verificarToken, obtenerSeccionAlianza)
router.get('/api/publico/alianza/:id', tiendaAlianzaPublica)
router.get('/api/publico/alianzas', listarAlianzasPublicas)

export default router