import express from "express"
import { verificarToken } from "../middleware/auth.middleware.js"
import { verificarRol } from "../middleware/verificarRol.middleware.js"
import {
  obtenerMetodosPago,
  actualizarMetodosPago,
  obtenerMetodosPagoPublico,
  obtenerConfigAdmin,
  actualizarConfigAdmin,
  obtenerConfigPublica,
} from "../controllers/metodosPago.controller.js"

const router = express.Router()

// Configuración por emprendedora (se mantiene para liquidación)
router.get("/api/emprendedora/metodos-pago",           verificarToken, obtenerMetodosPago)
router.put("/api/emprendedora/metodos-pago",           verificarToken, actualizarMetodosPago)
router.get("/api/tienda/:id_emprendedora/metodos-pago", obtenerMetodosPagoPublico)

// Configuración de plataforma — solo admin puede editarla
router.get("/api/admin/metodos-pago", verificarToken, verificarRol("admin"), obtenerConfigAdmin)
router.put("/api/admin/metodos-pago", verificarToken, verificarRol("admin"), actualizarConfigAdmin)

// Pública — cualquier cliente logueado la consulta en el checkout, no requiere ser admin
router.get("/api/metodos-pago/eva", verificarToken, obtenerConfigPublica)

export default router