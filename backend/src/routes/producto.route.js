import { Router } from 'express'
import { crearItem, obtenerItems, obtenerItemPorId, actualizarItem, eliminarItem, obtenerProductosPublicos, toggleVisible, listarTodosAdmin, listarMisItems,aprobarProducto } from '../controllers/producto.controller.js'
import { upload } from '../middleware/upload.middleware.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/crearitem',              verificarToken, upload.single('imagen'), crearItem)
router.get('/mis-items',               verificarToken, listarMisItems)          // ← PRIMERO
router.get('/admin/todos',             verificarToken, listarTodosAdmin)        // ← PRIMERO
router.get('/seccion/:id_seccion',     obtenerItems)
router.get('/tienda/:id_emprendedora', obtenerProductosPublicos)
router.patch('/:id/visible',           verificarToken, toggleVisible)
router.get('/:id',                     obtenerItemPorId)                        // ← AL FINAL
router.put('/:id',                     verificarToken, upload.single('imagen'), actualizarItem)
router.delete('/:id',                  verificarToken, eliminarItem)
router.patch('/:id/aprobar', verificarToken, aprobarProducto)

export default router