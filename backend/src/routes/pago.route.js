import { Router } from 'express'
import multer from 'multer'
import {
  crearPago,
  obtenerPago,
  verificarPago,
  listarPagosEmprendedora
} from '../controllers/Pago.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

// multer en memoria para subir a cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'))
  }
})

router.post('/api/pagos/:id_pedido',        verificarToken, upload.single('comprobante'), crearPago)
router.get('/api/pagos/pedido/:id_pedido',  verificarToken, obtenerPago)
router.put('/api/pagos/:id/verificar',      verificarToken, verificarPago)
router.get('/api/pagos/emprendedora',       verificarToken, listarPagosEmprendedora)

export default router