import { Router } from 'express'
import { crearItem, obtenerItems, obtenerItemPorId, actualizarItem, eliminarItem, obtenerProductosPublicos, toggleVisible } from '../controllers/producto.controller.js'
import { upload } from '../middleware/upload.middleware.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/crearitem',                verificarToken, upload.single('imagen'), crearItem)
router.get('/seccion/:id_seccion',       obtenerItems)
router.get('/tienda/:id_emprendedora',   obtenerProductosPublicos)  // ⬅️ antes de /:id
router.patch('/:id/visible',             verificarToken, toggleVisible)
router.get('/:id',                       obtenerItemPorId)           // ⬅️ al final
router.put('/:id',                       verificarToken, upload.single('imagen'), actualizarItem)
router.delete('/:id',                    verificarToken, eliminarItem)

export default router