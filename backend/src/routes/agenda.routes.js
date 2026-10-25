import { Router } from "express";
import {
  crearDisponibilidad,
  obtenerMiDisponibilidad,
  obtenerDisponibilidadPublica,
  obtenerHorariosDisponibles,
  actualizarDisponibilidad,
  desactivarDisponibilidad,
  crearCita,
  obtenerMisCitas,
  obtenerCitasRecibidas,
  responderCita,
  cancelarCita,
  proponerCambioCita,
  responderCambioCita,
  obtenerHistorialCambios,
  obtenerMensajesCita,
  enviarMensajeCita,
  marcarMensajesLeidos,
} from "../controllers/agenda.controller.js";
import { verificarToken } from "../middleware/auth.middleware.js";

const router = Router();

// ── Disponibilidad (RF-104, RF-111) ─────────────────────────────
// Las rutas específicas van antes de cualquier ruta dinámica.
router.get("/mia", verificarToken, obtenerMiDisponibilidad);
router.get("/horarios", obtenerHorariosDisponibles);
router.get("/emprendedora/:id_emprendedora", obtenerDisponibilidadPublica);

router.post("/", verificarToken, crearDisponibilidad);

// ── Citas (RF-105 a RF-110) ─────────────────────────────────────
router.post("/citas", verificarToken, crearCita);
router.get("/citas/mias", verificarToken, obtenerMisCitas);
router.get("/citas/recibidas", verificarToken, obtenerCitasRecibidas);

router.patch("/citas/:id/estado", verificarToken, responderCita);
router.patch("/citas/:id/cancelar", verificarToken, cancelarCita);

router.get("/citas/:id/cambios", verificarToken, obtenerHistorialCambios);
router.post("/citas/:id/cambios", verificarToken, proponerCambioCita);
router.patch(
  "/citas/:id/cambios/:id_cambio/respuesta",
  verificarToken,
  responderCambioCita,
);

// ── Mensajería de la cita ───────────────────────────────────────
router.get("/citas/:id/mensajes", verificarToken, obtenerMensajesCita);
router.post("/citas/:id/mensajes", verificarToken, enviarMensajeCita);
router.patch("/citas/:id/mensajes/leidos", verificarToken, marcarMensajesLeidos);

// ── Rutas dinámicas al final ────────────────────────────────────
router.patch("/:id", verificarToken, actualizarDisponibilidad);
router.delete("/:id", verificarToken, desactivarDisponibilidad);

export default router;
