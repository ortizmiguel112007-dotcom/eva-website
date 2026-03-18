import prisma from '../conexion.js'

// GET /api/pedidos — pedidos de la emprendedora logueada
export const listarPedidos = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: { secciones: true }
    })

    if (!emprendedora) return res.status(404).json({ error: 'Emprendedora no encontrada' })

    const idSecciones = emprendedora.secciones.map(s => s.id_seccion)

    const pedidos = await prisma.pedido.findMany({
      where: { id_seccion: { in: idSecciones } },
      include: {
        cliente: { select: { nombre: true, email: true, telefono: true } },
        detalles: {
          include: {
            producto: { select: { nombre_producto: true, imagen: true, precio: true } }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    })

    res.json(pedidos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener pedidos' })
  }
}

// PUT /api/pedidos/:id/estado — cambiar estado del pedido
export const cambiarEstadoPedido = async (req, res) => {
  try {
    const id_pedido = Number(req.params.id)
    const { estado } = req.body

    const estadosValidos = ['en_proceso', 'enviado', 'entregado', 'cancelado']
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' })
    }

    const pedido = await prisma.pedido.update({
      where: { id_pedido },
      data: { estado }
    })

    res.json({ message: 'Estado actualizado', pedido })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al cambiar estado' })
  }
}

// GET /api/pedidos/:id — detalle de un pedido
export const obtenerPedido = async (req, res) => {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(req.params.id) },
      include: {
        cliente: { select: { nombre: true, email: true, telefono: true } },
        detalles: {
          include: {
            producto: { select: { nombre_producto: true, imagen: true, precio: true } }
          }
        }
      }
    })

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
    res.json(pedido)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener pedido' })
  }
}