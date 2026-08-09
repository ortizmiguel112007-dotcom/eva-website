import { Router } from "express"
import { reporteEmprendedora, reporteAdmin } from "../controllers/reporte.controller.js"
import { verificarToken } from "../middleware/auth.middleware.js"
import { verificarRol } from "../middleware/verificarRol.middleware.js"

const router = Router()

router.get("/api/emprendedora/reportes/retroalimentacion", verificarToken, reporteEmprendedora)
router.get("/api/admin/reportes/retroalimentacion", verificarToken, verificarRol("admin"), reporteAdmin)

export default router