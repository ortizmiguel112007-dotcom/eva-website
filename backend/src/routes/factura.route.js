import { Router } from "express"
import {
  listarFacturasCliente,
  listarFacturasEmprendedora,
  listarFacturasAdmin,
  regenerarFactura,
} from "../controllers/factura.controller.js"
import { verificarToken } from "../middleware/auth.middleware.js"
import { verificarRol } from "../middleware/verificarRol.middleware.js"

const router = Router()

router.get("/api/cliente/facturas", verificarToken, listarFacturasCliente)
router.get("/api/emprendedora/facturas", verificarToken, listarFacturasEmprendedora)
router.get("/api/admin/facturas", verificarToken, verificarRol("admin"), listarFacturasAdmin)
router.put("/api/admin/facturas/:id/regenerar", verificarToken, verificarRol("admin"), regenerarFactura)

export default router