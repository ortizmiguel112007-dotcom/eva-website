import prisma from '../conexion.js'

// Helper — registra un movimiento
export const registrarMovimiento = async (id_producto, tipo, cantidad_antes, cantidad_nueva, id_usuario, motivo = null) => {
  try {
    await prisma.movimientoInventario.create({
      data: { id_producto, tipo, cantidad_antes, cantidad_nueva, id_usuario, motivo }
    })
  } catch (err) {
    console.error('Error al registrar movimiento:', err)
  }
}

// GET /api/movimientos/:id_producto — historial de un producto
export const listarMovimientos = async (req, res) => {
  try {
    const id_producto = Number(req.params.id_producto)
    const movimientos = await prisma.movimientoInventario.findMany({
      where: { id_producto },
      include: { usuario: { select: { nombre: true } } },
      orderBy: { fecha: 'desc' },
      take: 50
    })
    res.json(movimientos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener movimientos' })
  }
}