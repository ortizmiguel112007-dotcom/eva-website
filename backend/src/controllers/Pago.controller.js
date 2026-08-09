import prisma from "../conexion.js"
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"
import { crearNotificacion } from "./notificacion.controller.js"
import { enviarConfirmacionPedido } from "../services/notificacion.service.js"
import { crearFactura } from "./factura.controller.js"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Registra cualquier evento del ciclo de vida de un pago (éxito o error) — RF-069 / RN-057
export const registrarLog = async (id_pago, evento, detalle = null, id_usuario = null) => {
  try {
    await prisma.pagoLog.create({
      data: { id_pago, evento, detalle, id_usuario },
    })
  } catch (err) {
    console.error("Error registrando PagoLog:", err)
  }
}

// PUT /api/pagos/:id_pago/comprobante — cliente sube o reenvía comprobante
export const subirComprobante = async (req, res) => {
  const id_pago = Number(req.params.id_pago)
  try {
    const pago = await prisma.pago.findUnique({ where: { id_pago } })

    if (!pago) return res.status(404).json({ error: "Pago no encontrado" })
    if (pago.id_cliente !== req.user.id) return res.status(403).json({ error: "No autorizado" })
    if (!["pendiente", "rechazado"].includes(pago.estado))
      return res.status(400).json({ error: "Este pago ya fue procesado" })
    if (!req.file) return res.status(400).json({ error: "Debes subir un comprobante" })

    const stream = cloudinary.uploader.upload_stream(
      { folder: "eva-comprobantes", resource_type: "image" },
      async (error, result) => {
        if (error) {
          console.error("Error Cloudinary:", error)
          await registrarLog(id_pago, "error_subida", error.message, req.user.id)
          return res.status(500).json({ error: "Error al subir comprobante" })
        }

        const pagoActualizado = await prisma.pago.update({
          where: { id_pago },
          data: {
            comprobante:  result.secure_url,
            estado:       "pendiente",
            nota_rechazo: null,
            fecha_verif:  null,
          },
        })

        await registrarLog(id_pago, "comprobante_subido", null, req.user.id)

        await prisma.pedido.updateMany({
          where: { id_pago },
          data:  { estado: "pago_enviado" },
        })

        const pedidos = await prisma.pedido.findMany({
          where: { id_pago },
          include: { seccion: { include: { emprendedora: { include: { usuario: true } } } } },
        })
        const notificadas = new Set()
        for (const pedido of pedidos) {
          const idUsuario = pedido.seccion?.emprendedora?.usuario?.id
          if (idUsuario && !notificadas.has(pedido.id_seccion)) {
            notificadas.add(pedido.id_seccion)
            await crearNotificacion(
              idUsuario, "pago", "Comprobante recibido",
              `Un cliente subió el comprobante de pago (pedido #${pedido.id_pedido}).`, "/pagos",
            )
          }
        }

        return res.status(200).json({ message: "Comprobante enviado correctamente", pago: pagoActualizado })
      },
    )
    streamifier.createReadStream(req.file.buffer).pipe(stream)
  } catch (error) {
    console.error(error)
    await registrarLog(id_pago, "error_subida", error.message, req.user?.id)
    res.status(500).json({ error: "Error al procesar comprobante" })
  }
}

// GET /api/pagos/:id_pago — detalle de un pago con sus pedidos
export const obtenerPago = async (req, res) => {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id_pago: Number(req.params.id_pago) },
      include: {
        pedidos: {
          include: {
            detalles: { include: { producto: { select: { nombre_producto: true } } } },
            seccion:  { include: { emprendedora: { include: { usuario: { select: { nombre: true } } } } } },
          },
        },
      },
    })
    if (!pago) return res.status(404).json({ error: "Pago no encontrado" })
    if (pago.id_cliente !== req.user.id && req.user.rol !== "admin")
      return res.status(403).json({ error: "No autorizado" })
    res.json(pago)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener pago" })
  }
}

// PUT /api/pagos/:id_pago/verificar — admin aprueba o rechaza el pago
export const verificarPago = async (req, res) => {
  const id_pago = Number(req.params.id_pago)
  try {
    const { estado, nota_rechazo } = req.body

    if (!["aprobado", "rechazado"].includes(estado))
      return res.status(400).json({ error: "Estado inválido" })

    const pagoActual = await prisma.pago.findUnique({
      where: { id_pago },
      include: {
        cliente: { select: { email: true, nombre: true } },
        pedidos: {
          include: {
            detalles: { include: { producto: { select: { nombre_producto: true } } } },
            seccion:  { include: { emprendedora: { include: { usuario: true } } } },
          },
        },
      },
    })
    if (!pagoActual) return res.status(404).json({ error: "Pago no encontrado" })

    const pago = await prisma.pago.update({
      where: { id_pago },
      data: {
        estado,
        fecha_verif:  new Date(),
        nota_rechazo: estado === "rechazado" ? nota_rechazo || null : null,
      },
    })

    if (estado === "aprobado") {
      await prisma.pedido.updateMany({ where: { id_pago }, data: { estado: "en_proceso" } })
      await registrarLog(id_pago, "aprobado", null, req.user.id)

      // RF-054/RN-042: generar factura por cada pedido, y guardar su buffer para adjuntarlo al correo
      const facturasPorPedido = {}
      for (const pedido of pagoActual.pedidos) {
        const resultado = await crearFactura({ ...pedido, cliente: pagoActual.cliente })
        if (resultado) facturasPorPedido[pedido.id_pedido] = resultado
      }

      // Genera una liquidación pendiente por cada pedido (RF: repartir a cada emprendedora)
      for (const pedido of pagoActual.pedidos) {
        const idEmprendedora = pedido.seccion?.emprendedora?.id_emprendedora
        if (idEmprendedora) {
          await prisma.liquidacion.upsert({
            where: { id_pedido: pedido.id_pedido },
            update: {}, // si ya existe (caso raro), no la duplica ni sobreescribe
            create: {
              id_pedido: pedido.id_pedido,
              id_emprendedora: idEmprendedora,
              monto: pedido.total,
              estado: "pendiente",
            },
          })
        }
      }

      const notificadas = new Set()
      for (const pedido of pagoActual.pedidos) {
        const idUsuario = pedido.seccion?.emprendedora?.usuario?.id
        if (idUsuario && !notificadas.has(pedido.id_seccion)) {
          notificadas.add(pedido.id_seccion)
          await crearNotificacion(
            idUsuario, "pago", "Pago confirmado",
            `Se confirmó el pago del pedido #${pedido.id_pedido}.`, "/pagos",
          )
        }
      }

      // Correo fusionado: confirmación de pago + factura adjunta
      for (const pedido of pagoActual.pedidos) {
        try {
          const facturaInfo = facturasPorPedido[pedido.id_pedido]
          const adjunto = facturaInfo
            ? { filename: `${facturaInfo.numero}.pdf`, buffer: facturaInfo.bufferPDF }
            : null

          await enviarConfirmacionPedido(
            pagoActual.cliente.email,
            pagoActual.cliente.nombre?.trim(),
            pedido,
            "pago",
            adjunto,
          )
        } catch (err) {
          console.error("Error enviando correo de confirmación:", err)
        }
      }

    } else if (estado === "rechazado") {
      await prisma.pedido.updateMany({ where: { id_pago }, data: { estado: "pago_rechazado" } })
      await registrarLog(id_pago, "rechazado", nota_rechazo || null, req.user.id)
      await crearNotificacion(
        pagoActual.id_cliente, "pago", "Pago rechazado",
        `Tu comprobante fue rechazado. ${nota_rechazo || ""}`, "/mis-pedidos",
      )
    }

    res.json({ message: `Pago ${estado}`, pago })
  } catch (error) {
    console.error(error)
    await registrarLog(id_pago, "error_verificacion", error.message, req.user?.id)
    res.status(500).json({ error: "Error al verificar pago" })
  }
}

// GET /api/pagos/emprendedora — pagos que incluyen pedidos de la emprendedora logueada
export const listarPagosEmprendedora = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where:   { id_usuario: req.user.id },
      include: { secciones: true },
    })
    if (!emprendedora) return res.status(404).json({ error: "Emprendedora no encontrada" })

    const idSecciones = emprendedora.secciones.map(s => s.id_seccion)

    const pagos = await prisma.pago.findMany({
      where: { pedidos: { some: { id_seccion: { in: idSecciones } } } },
      include: {
        cliente: { select: { nombre: true, email: true } },
        pedidos: {
          where: { id_seccion: { in: idSecciones } },
          include: { detalles: { include: { producto: { select: { nombre_producto: true } } } } },
        },
      },
      orderBy: { fecha: "desc" },
    })

    res.json(pagos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener pagos" })
  }
}

// GET /api/admin/pagos — todos los pagos de la plataforma (solo admin, RF-073)
export const listarPagosAdmin = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      include: {
        cliente: { select: { nombre: true, email: true } },
        pedidos: {
          include: {
            detalles: { include: { producto: { select: { nombre_producto: true } } } },
            seccion:  { include: { emprendedora: { include: { usuario: { select: { nombre: true } } } } } },
          },
        },
      },
      orderBy: { fecha: "desc" },
    })
    res.json(pagos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener pagos" })
  }
}

// GET /api/admin/pagos/:id_pago/historial — auditoría completa de un pago (RI-069)
export const historialPago = async (req, res) => {
  try {
    const logs = await prisma.pagoLog.findMany({
      where: { id_pago: Number(req.params.id_pago) },
      include: { usuario: { select: { nombre: true, rol: true } } },
      orderBy: { fecha: "asc" },
    })
    res.json(logs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener historial" })
  }
}