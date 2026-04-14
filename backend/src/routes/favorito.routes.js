import { Router } from 'express'
import { toggleFavorito, listarFavoritos, favoritosTienda, checkFavorito } from '../controllers/favorito.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/api/favoritos',                    verificarToken, listarFavoritos)
router.get('/api/favoritos/tienda',             verificarToken, favoritosTienda)
router.get('/api/favoritos/check/:id_producto', verificarToken, checkFavorito)
router.post('/api/favoritos/:id_producto',      verificarToken, toggleFavorito)

export default router