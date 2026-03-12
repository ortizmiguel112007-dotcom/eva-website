import { Router } from 'express'
import { crearItem, obtenerItems, obtenerItemPorId, actualizarItem, eliminarItem } from '../controllers/producto.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

router.post('/crearitem',            verificarToken, upload.single('imagen'), crearItem)
router.get('/seccion/:id_seccion',   obtenerItems)
router.get('/:id',                   obtenerItemPorId)
router.put('/:id',                   verificarToken, upload.single('imagen'), actualizarItem)
router.delete('/:id',                verificarToken, eliminarItem)

export default router