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

// POST /api/cliente/pedidos — crear pedido desde el carrito
export const crearPedido = async (req, res) => {
  try {
    const id_cliente = req.user.id
    const { items, metodo_pago, nota } = req.body

    if (!items || items.length === 0)
      return res.status(400).json({ error: 'El carrito está vacío' })
    if (!metodo_pago)
      return res.status(400).json({ error: 'Debes seleccionar un método de pago' })

    // agrupar items por sección
    const productosIds = items.map(i => i.id_producto)
    const productos = await prisma.producto.findMany({
      where: { id_producto: { in: productosIds } },
      include: { seccion: true }
    })

    // todos los items deben ser de la misma sección
    const secciones = [...new Set(productos.map(p => p.id_seccion))]
    if (secciones.length > 1)
      return res.status(400).json({ error: 'Solo puedes comprar productos de una tienda a la vez' })

    const id_seccion = secciones[0]
    const total = items.reduce((acc, i) => {
      const prod = productos.find(p => p.id_producto === i.id_producto)
      return acc + Number(prod.precio) * i.cantidad
    }, 0)

    const pedido = await prisma.$transaction(async (tx) => {
      const nuevoPedido = await tx.pedido.create({
        data: {
          id_cliente,
          id_seccion,
          metodo_pago,
          nota: nota || null,
          total,
          estado: 'en_proceso',
          detalles: {
            create: items.map(i => {
              const prod = productos.find(p => p.id_producto === i.id_producto)
              return {
                id_producto: i.id_producto,
                cantidad:    i.cantidad,
                precio_unit: Number(prod.precio)
              }
            })
          }
        },
        include: {
          detalles: {
            include: {
              producto: { select: { nombre_producto: true, imagen: true } }
            }
          }
        }
      })

      // descontar stock (RF-024)
      for (const item of items) {
        await tx.inventario.updateMany({
          where: { id_producto: item.id_producto },
          data: { cantidad: { decrement: item.cantidad } }
        })
      }

      return nuevoPedido
    })

    res.status(201).json({ message: 'Pedido creado correctamente', pedido })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear pedido' })
  }
}

// GET /api/cliente/pedidos — historial de pedidos del cliente
export const listarPedidosCliente = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { id_cliente: req.user.id },
      include: {
        detalles: {
          include: {
            producto: { select: { nombre_producto: true, imagen: true, precio: true } }
          }
        },
        seccion: {
          include: {
            emprendedora: {
              include: { usuario: { select: { nombre: true } } }
            }
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