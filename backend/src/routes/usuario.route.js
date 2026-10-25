import { Router } from 'express'
import { CreaterDate,obtenerPerfil, actualizarPerfil } from '../controllers/usuario.controller.js'
import { verificarCodigo } from '../controllers/verificar.codigo.js'
import { Login } from '../controllers/usuario.controller.js'
import { verificarToken } from '../middleware/auth.middleware.js'
import { uploadDocumento } from '../middleware/upload.middleware.js'

const router = Router()

router.post(
  "/registro",
  uploadDocumento.single("foto_documento"),
  (req, res, next) => {
    console.log("Archivo recibido por Multer:", req.file);
    console.log("Datos recibidos:", req.body);
    next();
  },
  CreaterDate
);

router.post('/verificar', verificarCodigo)
router.post('/login', Login)
router.get('/api/perfil', verificarToken, obtenerPerfil)
router.put('/api/perfil', verificarToken, actualizarPerfil)

export default router