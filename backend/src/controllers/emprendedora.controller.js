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
export const getMiPerfil = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      select: { datos_bancarios: true, id_emprendedora: true }
    })
    if (!emprendedora) return res.status(404).json({ error: 'No encontrada' })
    res.json(emprendedora)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
}
// GET /api/emprendedora/datos-bancarios/:id_seccion
export const getDatosBancarios = async (req, res) => {
  try {
    const id_seccion = Number(req.params.id_seccion)
    const seccion = await prisma.seccion.findUnique({
      where: { id_seccion },
      include: {
        emprendedora: {
          select: { datos_bancarios: true, usuario: { select: { nombre: true } } }
        }
      }
    })
    if (!seccion) return res.status(404).json({ error: 'Sección no encontrada' })
    res.json({
      datos_bancarios: seccion.emprendedora?.datos_bancarios || null,
      nombre: seccion.emprendedora?.usuario?.nombre || "EVA"
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener datos bancarios' })
  }
}
// PUT /api/emprendedora/datos-bancarios
export const actualizarDatosBancarios = async (req, res) => {
  try {
    const { datos_bancarios } = req.body
    const emprendedora = await prisma.emprendedora.update({
      where: { id_usuario: req.user.id },
      data: { datos_bancarios }
    })
    res.json({ message: 'Datos bancarios actualizados', emprendedora })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar datos bancarios' })
  }
}