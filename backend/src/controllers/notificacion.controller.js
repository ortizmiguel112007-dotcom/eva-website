import prisma from '../conexion.js'

// GET /api/notificaciones — listar notificaciones del usuario
export const listarNotificaciones = async (req, res) => {
  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: { id_usuario: req.user.id },
      orderBy: { fecha: 'desc' },
      take: 50
    })
    res.json(notificaciones)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener notificaciones' })
  }
}

// PUT /api/notificaciones/:id/leer — marcar como leída
export const marcarLeida = async (req, res) => {
  try {
    await prisma.notificacion.update({
      where: { id_notificacion: Number(req.params.id) },
      data: { leida: true }
    })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificación' })
  }
}

// PUT /api/notificaciones/leer-todas — marcar todas como leídas
export const marcarTodasLeidas = async (req, res) => {
  try {
    await prisma.notificacion.updateMany({
      where: { id_usuario: req.user.id, leida: false },
      data: { leida: true }
    })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificaciones' })
  }
}

// Función helper para crear notificaciones (se usa desde otros controllers)
export const crearNotificacion = async (id_usuario, tipo, titulo, mensaje, url = null) => {
  try {
    await prisma.notificacion.create({
      data: { id_usuario, tipo, titulo, mensaje, url }
    })
  } catch (error) {
    console.error('Error creando notificación:', error)
  }
}