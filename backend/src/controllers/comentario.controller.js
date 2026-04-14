import prisma from '../conexion.js'
import { crearNotificacion } from './notificacion.controller.js'

// GET /api/comentarios — comentarios de los productos de la emprendedora
export const listarComentarios = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: {
        secciones: {
          include: {
            productos: {
              include: {
                comentarios: {
                  where: { activo: true },
                  include: {
                    usuario: { select: { nombre: true, email: true } }
                  },
                  orderBy: { fecha: 'desc' }
                }
              }
            }
          }
        }
      }
    })

    if (!emprendedora) return res.status(404).json({ error: 'Emprendedora no encontrada' })

    const comentarios = emprendedora.secciones
      .flatMap(s => s.productos)
      .flatMap(p => p.comentarios.map(c => ({
        ...c,
        producto_nombre: p.nombre_producto,
        producto_imagen: p.imagen,
      })))

    res.json(comentarios)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener comentarios' })
  }
}

// POST /api/comentarios — crear comentario (cliente)
export const crearComentario = async (req, res) => {
  try {
    const { id_producto, id_pedido, calificacion, texto } = req.body

    if (!texto?.trim()) return res.status(400).json({ error: 'El comentario no puede estar vacío' })
    if (!calificacion || calificacion < 1 || calificacion > 5)
      return res.status(400).json({ error: 'La calificación debe ser entre 1 y 5' })

    // verificar que el pedido está entregado
    const pedido = await prisma.pedido.findUnique({ where: { id_pedido: Number(id_pedido) } })
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
    if (pedido.estado !== 'entregado')
      return res.status(400).json({ error: 'Solo puedes comentar pedidos entregados' })
    if (pedido.id_cliente !== req.user.id)
      return res.status(403).json({ error: 'No autorizado' })

    const comentario = await prisma.comentario.create({
      data: {
        id_producto:  Number(id_producto),
        id_usuario:   req.user.id,
        id_pedido:    Number(id_pedido),
        calificacion: Number(calificacion),
        texto:        texto.trim(),
      }
    })
     const prodConEmp = await prisma.producto.findUnique({
      where: { id_producto: Number(id_producto) },
      include: {
        seccion: { include: { emprendedora: { include: { usuario: true } } } }
      }
    })
    if (prodConEmp?.seccion?.emprendedora?.usuario) {
      await crearNotificacion(
        prodConEmp.seccion.emprendedora.usuario.id,
        'comentario',
        'Nuevo comentario',
        `Alguien dejó una reseña en "${prodConEmp.nombre_producto}".`,
        '/comentarios'
      )
    }

    res.status(201).json({ message: 'Comentario creado', comentario })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear comentario' })
  }
  
}

// PUT /api/comentarios/:id/ocultar — ocultar comentario (admin/emprendedora)
export const ocultarComentario = async (req, res) => {
  try {
    const id_comentario = Number(req.params.id)

    await prisma.comentario.update({
      where: { id_comentario },
      data: { activo: false }
    })

    res.json({ message: 'Comentario ocultado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al ocultar comentario' })
  }
}

// GET /api/comentarios/producto/:id — comentarios públicos de un producto
export const listarComentariosPorProducto = async (req, res) => {
  try {
    const id_producto = Number(req.params.id)
    const comentarios = await prisma.comentario.findMany({
      where: { id_producto, activo: true },
      include: {
        usuario: { select: { nombre: true } }
      },
      orderBy: { fecha: 'desc' }
    })
    res.json(comentarios)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener comentarios' })
  }
}

// GET /api/admin/comentarios — TODOS los comentarios (solo admin)
export const listarTodosComentariosAdmin = async (req, res) => {
  try {
    const comentarios = await prisma.comentario.findMany({
      include: {
        usuario: { select: { nombre: true, email: true } },
        producto: { select: { nombre_producto: true, imagen: true } }
      },
      orderBy: { fecha: 'desc' }
    })

    const resultado = comentarios.map(c => ({
      ...c,
      producto_nombre: c.producto?.nombre_producto,
      producto_imagen: c.producto?.imagen,
    }))

    res.json(resultado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener comentarios' })
  }
}