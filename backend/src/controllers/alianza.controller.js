import prisma from '../conexion.js'

// GET /api/alianzas — listar alianzas de la emprendedora
export const listarAlianzas = async (req, res) => {
  try {
    const alianzas = await prisma.alianza.findMany({
      where: {
        OR: [
          { creada_por: req.user.id },
          { participantes: { some: { id_usuario: req.user.id } } }
        ]
      },
      include: {
        creador: { select: { nombre: true, email: true } },
        participantes: {
          include: {
            usuario: { select: { nombre: true, email: true } }
          }
        }
      },
      orderBy: { fecha_inicio: 'desc' }
    })
    res.json(alianzas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener alianzas' })
  }
}

// POST /api/alianzas — crear alianza
export const crearAlianza = async (req, res) => {
  try {
    const { nombre, descripcion, fecha_fin, id_invitada } = req.body

    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })

    // verificar que la invitada es emprendedora
    const invitada = await prisma.user.findUnique({
      where: { id: Number(id_invitada) }
    })
    if (!invitada || invitada.rol !== 'emprendedora') {
      return res.status(400).json({ error: 'La invitada debe ser emprendedora' })
    }

    const alianza = await prisma.$transaction(async (tx) => {
      const nueva = await tx.alianza.create({
        data: {
          nombre,
          descripcion,
          fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
          creada_por: req.user.id,
        }
      })

      // creador autorizado automáticamente
      await tx.alianzaParticipante.create({
        data: { id_alianza: nueva.id_alianza, id_usuario: req.user.id, autorizado: true }
      })

      // invitada pendiente de autorización
      await tx.alianzaParticipante.create({
        data: { id_alianza: nueva.id_alianza, id_usuario: Number(id_invitada), autorizado: false }
      })

      return nueva
    })

    res.status(201).json({ message: 'Alianza creada', alianza })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear alianza' })
  }
}

// PUT /api/alianzas/:id/autorizar — autorizar participación
export const autorizarAlianza = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id)

    await prisma.alianzaParticipante.update({
      where: {
        id_alianza_id_usuario: { id_alianza, id_usuario: req.user.id }
      },
      data: { autorizado: true }
    })

    // verificar si todos autorizaron para activar la alianza
    const participantes = await prisma.alianzaParticipante.findMany({
      where: { id_alianza }
    })

    const todosAutorizaron = participantes.every(p => p.autorizado)

    if (todosAutorizaron) {
      await prisma.alianza.update({
        where: { id_alianza },
        data: { estado: 'activa' }
      })
    }

    res.json({ message: 'Autorización registrada', activa: todosAutorizaron })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al autorizar' })
  }
}

// PUT /api/alianzas/:id/finalizar — finalizar alianza
export const finalizarAlianza = async (req, res) => {
  try {
    const id_alianza = Number(req.params.id)

    const alianza = await prisma.alianza.findUnique({ where: { id_alianza } })
    if (!alianza) return res.status(404).json({ error: 'Alianza no encontrada' })
    if (alianza.creada_por !== req.user.id) {
      return res.status(403).json({ error: 'Solo el creador puede finalizar' })
    }

    await prisma.alianza.update({
      where: { id_alianza },
      data: { estado: 'finalizada', fecha_fin: new Date() }
    })

    res.json({ message: 'Alianza finalizada' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al finalizar alianza' })
  }
}

// GET /api/alianzas/emprendedoras — listar emprendedoras para invitar
export const listarEmprendedoras = async (req, res) => {
  try {
    const emprendedoras = await prisma.user.findMany({
      where: {
        rol: 'emprendedora',
        activo: true,
        id: { not: req.user.id }
      },
      select: { id: true, nombre: true, email: true }
    })
    res.json(emprendedoras)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener emprendedoras' })
  }
}