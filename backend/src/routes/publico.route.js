import { Router } from 'express'
import { getDestacados, getCatalogo, getTiendas } from '../controllers/publico.controller.js'

const router = Router()

router.get('/api/publico/destacados', getDestacados)
router.get('/api/publico/productos',  getCatalogo)
router.get('/api/publico/tiendas',    getTiendas)

export default router