import { Router } from 'express'
import multer from 'multer'
import {
  subirComprobante,
  obtenerPago,
  verificarPago,
  listarPagosEmprendedora,
  listarPagosAdmin,
  historialPago,
} from '../controllers/Pago.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'
import { verificarRol } from '../middleware/verificarRol.middleware.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'))
  }
})

// ── Rutas con segmento FIJO primero (para que Express no las confunda con :id_pago) ──
router.get('/api/pagos/emprendedora',             verificarToken, listarPagosEmprendedora)
router.get('/api/admin/pagos',                    verificarToken, verificarRol("admin"), listarPagosAdmin)
router.get('/api/admin/pagos/:id_pago/historial', verificarToken, verificarRol("admin"), historialPago)

// ── Rutas con parámetro dinámico después ──
router.put('/api/pagos/:id_pago/comprobante', verificarToken, upload.single('comprobante'), subirComprobante)
router.get('/api/pagos/:id_pago',             verificarToken, obtenerPago)
router.put('/api/pagos/:id_pago/verificar',   verificarToken, verificarRol("admin"), verificarPago)

export default router