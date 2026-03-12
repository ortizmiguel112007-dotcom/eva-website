import prisma from '../conexion.js'

// GET /api/emprendedora/mi-seccion
// Requiere token — busca la emprendedora y su primera sección según el id del usuario
export const getMiSeccion = async (req, res) => {
  try {
    const id_usuario = req.user.id  // viene del middleware de auth

    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario },
      include: {
        secciones: {
          orderBy: { fecha_creacion: 'asc' },
          take: 1,  // tomamos la primera sección
        },
      },
    })

    if (!emprendedora) {
      return res.status(404).json({ error: 'Emprendedora no encontrada' })
    }

    if (!emprendedora.secciones.length) {
      return res.status(404).json({ error: 'No tienes ninguna sección creada' })
    }

    return res.json({
      id_emprendedora: emprendedora.id_emprendedora,
      id_seccion:      emprendedora.secciones[0].id_seccion,
      nombre_seccion:  emprendedora.secciones[0].nombre_seccion,
    })
  } catch (error) {
    console.error('Error al obtener sección:', error)
    return res.status(500).json({ error: 'Error al obtener la sección' })
  }
}