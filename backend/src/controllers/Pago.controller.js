import prisma from '../conexion.js'
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})
// POST /api/pagos/:id_pedido — crear pago y subir comprobante
export const crearPago = async (req, res) => {
  try {
    const id_pedido = Number(req.params.id_pedido)

    // verificar que el pedido existe y pertenece al cliente
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido },
      include: { pago: true }
    })

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
    if (pedido.id_cliente !== req.user.id)
      return res.status(403).json({ error: 'No autorizado' })
    if (pedido.pago)
      return res.status(400).json({ error: 'Este pedido ya tiene un comprobante enviado' })

    let comprobante_url = null

    // subir imagen a cloudinary si viene archivo
    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'eva-comprobantes', resource_type: 'image' },
        async (error, result) => {
          if (error) {
            console.error('Error Cloudinary:', error)
            return res.status(500).json({ error: 'Error al subir comprobante' })
          }

          const pago = await prisma.pago.create({
            data: {
              id_pedido,
              metodo:      pedido.metodo_pago || 'qr',
              estado:      'pendiente',
              comprobante: result.secure_url,
            }
          })

          return res.status(201).json({ message: 'Comprobante enviado correctamente', pago })
        }
      )
      streamifier.createReadStream(req.file.buffer).pipe(stream)
    } else {
      // sin comprobante — crear pago pendiente sin imagen
      const pago = await prisma.pago.create({
        data: {
          id_pedido,
          metodo: pedido.metodo_pago || 'qr',
          estado: 'pendiente',
        }
      })
      return res.status(201).json({ message: 'Pago registrado, pendiente de comprobante', pago })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al procesar pago' })
  }
}

// GET /api/pagos/pedido/:id_pedido — obtener pago de un pedido
export const obtenerPago = async (req, res) => {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id_pedido: Number(req.params.id_pedido) }
    })
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' })
    res.json(pago)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener pago' })
  }
}

// PUT /api/pagos/:id/verificar — emprendedora verifica el pago
export const verificarPago = async (req, res) => {
  try {
    const id_pago = Number(req.params.id)
    const { estado, nota_rechazo } = req.body // estado: "verificado" o "rechazado"

    if (!['verificado', 'rechazado'].includes(estado))
      return res.status(400).json({ error: 'Estado inválido' })

    const pago = await prisma.pago.update({
      where: { id_pago },
      data: {
        estado,
        fecha_verif:  new Date(),
        nota_rechazo: estado === 'rechazado' ? nota_rechazo || null : null,
      }
    })

    // si verificado → actualizar pedido a "entregado" o dejar en proceso
    if (estado === 'verificado') {
      await prisma.pedido.update({
        where: { id_pedido: pago.id_pedido },
        data:  { estado: 'en_proceso' }
      })
    }

    res.json({ message: `Pago ${estado}`, pago })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al verificar pago' })
  }
}

// GET /api/pagos/emprendedora — pagos de los pedidos de la emprendedora
export const listarPagosEmprendedora = async (req, res) => {
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
        pago: true,
        cliente: { select: { nombre: true, email: true } },
        detalles: { include: { producto: { select: { nombre_producto: true } } } }
      },
      orderBy: { fecha: 'desc' }
    })

    const pagos = pedidos
      .filter(p => p.pago)
      .map(p => ({ ...p.pago, pedido: p }))

    res.json(pagos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener pagos' })
  }
}