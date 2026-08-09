import { Router } from 'express'
import {
  listarLiquidacionesAdmin,
  listarLiquidacionesEmprendedora,
  marcarLiquidacionPagada,
  backfillLiquidaciones,
} from '../controllers/liquidacion.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'
import { verificarRol } from '../middleware/verificarRol.middleware.js'

const router = Router()

router.get('/api/emprendedora/liquidaciones',    verificarToken, listarLiquidacionesEmprendedora)
router.get('/api/admin/liquidaciones',           verificarToken, verificarRol("admin"), listarLiquidacionesAdmin)
router.put('/api/admin/liquidaciones/:id/pagar', verificarToken, verificarRol("admin"), marcarLiquidacionPagada)
router.post('/api/admin/liquidaciones/backfill', verificarToken, verificarRol("admin"), backfillLiquidaciones)

export default router