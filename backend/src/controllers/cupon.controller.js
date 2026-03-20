import prisma from '../conexion.js'

// GET /api/cupones — listar cupones de la emprendedora
export const listarCupones = async (req, res) => {
  try {
    const cupones = await prisma.cupon.findMany({
      where: { id_usuario: req.user.id },
      orderBy: { fecha_inicio: 'desc' }
    })
    res.json(cupones)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener cupones' })
  }
}

// POST /api/cupones — crear cupón
export const crearCupon = async (req, res) => {
  try {
    const { codigo, tipo, valor, descripcion, fecha_fin, limite_usos } = req.body

    if (!codigo || !tipo || !valor)
      return res.status(400).json({ error: 'Código, tipo y valor son obligatorios' })

    if (!['porcentaje', 'valor_fijo'].includes(tipo))
      return res.status(400).json({ error: 'Tipo inválido' })

    if (tipo === 'porcentaje' && (Number(valor) < 1 || Number(valor) > 100))
      return res.status(400).json({ error: 'El porcentaje debe estar entre 1 y 100' })

    const existe = await prisma.cupon.findUnique({ where: { codigo } })
    if (existe) return res.status(409).json({ error: 'El código ya existe' })

    const cupon = await prisma.cupon.create({
      data: {
        id_usuario:  req.user.id,
        codigo:      codigo.toUpperCase(),
        tipo,
        valor:       Number(valor),
        descripcion: descripcion || null,
        fecha_fin:   fecha_fin ? new Date(fecha_fin) : null,
        limite_usos: limite_usos ? Number(limite_usos) : null,
      }
    })

    res.status(201).json({ message: 'Cupón creado', cupon })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear cupón' })
  }
}

// PUT /api/cupones/:id/toggle — activar/desactivar
export const toggleCupon = async (req, res) => {
  try {
    const id_cupon = Number(req.params.id)
    const cupon = await prisma.cupon.findUnique({ where: { id_cupon } })
    if (!cupon) return res.status(404).json({ error: 'Cupón no encontrado' })
    if (cupon.id_usuario !== req.user.id)
      return res.status(403).json({ error: 'No autorizado' })

    const actualizado = await prisma.cupon.update({
      where: { id_cupon },
      data: { activo: !cupon.activo }
    })

    res.json({ message: `Cupón ${actualizado.activo ? 'activado' : 'desactivado'}`, cupon: actualizado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al cambiar estado' })
  }
}

// DELETE /api/cupones/:id — eliminar cupón
export const eliminarCupon = async (req, res) => {
  try {
    const id_cupon = Number(req.params.id)
    const cupon = await prisma.cupon.findUnique({ where: { id_cupon } })
    if (!cupon) return res.status(404).json({ error: 'Cupón no encontrado' })
    if (cupon.id_usuario !== req.user.id)
      return res.status(403).json({ error: 'No autorizado' })

    await prisma.cupon.delete({ where: { id_cupon } })
    res.json({ message: 'Cupón eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar cupón' })
  }
}

// POST /api/cupones/validar — validar cupón (para el carrito)
export const validarCupon = async (req, res) => {
  try {
    const { codigo } = req.body
    const cupon = await prisma.cupon.findUnique({ where: { codigo: codigo.toUpperCase() } })

    if (!cupon) return res.status(404).json({ error: 'Cupón no encontrado' })
    if (!cupon.activo) return res.status(400).json({ error: 'Cupón inactivo' })
    if (cupon.fecha_fin && new Date() > cupon.fecha_fin)
      return res.status(400).json({ error: 'Cupón expirado' })
    if (cupon.limite_usos && cupon.usos >= cupon.limite_usos)
      return res.status(400).json({ error: 'Cupón agotado' })

    res.json({
      valido: true,
      tipo:   cupon.tipo,
      valor:  cupon.valor,
      codigo: cupon.codigo
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al validar cupón' })
  }
}