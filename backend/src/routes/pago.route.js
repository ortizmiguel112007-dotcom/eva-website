import express from 'express'
import multer from 'multer'
import {
  crearPago,
  listarPagosCliente,
  listarPagosEmprendedora,
  verificarPago,
  reenviarComprobante,
  listarPagosAdmin,
} from '../controllers/Pago.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'))
  }
})

router.post('/api/pagos',                    verificarToken, upload.single('comprobante'), crearPago)
router.get('/api/pagos/mis-pagos',           verificarToken, listarPagosCliente)
router.get('/api/pagos/emprendedora',        verificarToken, listarPagosEmprendedora)
router.put('/api/pagos/:id_pago/verificar',  verificarToken, verificarPago)
router.put('/api/pagos/:id_pago/reenviar',   verificarToken, upload.single('comprobante'), reenviarComprobante)
router.get('/api/admin/pagos',               verificarToken, listarPagosAdmin)

export default router