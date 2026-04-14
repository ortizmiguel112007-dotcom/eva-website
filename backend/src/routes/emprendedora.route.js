import { Router } from 'express'
import { getMiSeccion, getDatosBancarios, actualizarDatosBancarios, getMiPerfil } from '../controllers/emprendedora.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/mi-seccion',                  verificarToken, getMiSeccion)
router.get('/datos-bancarios/:id_seccion', verificarToken, getDatosBancarios)
router.put('/datos-bancarios', verificarToken, actualizarDatosBancarios)
router.get('/mi-perfil', verificarToken, getMiPerfil)

export default router