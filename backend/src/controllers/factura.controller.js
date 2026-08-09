import prisma from "../conexion.js"
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"
import { generarFacturaPDF } from "../services/factura.service.js"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const subirPDFaCloudinary = (buffer, numero) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "eva-facturas", resource_type: "raw", public_id: numero, format: "pdf" },
      (error, result) => {
        if (error) return reject(error)
        resolve(result.secure_url)
      },
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

// Genera y guarda la factura de un pedido. Devuelve { factura, bufferPDF, numero }
// bufferPDF se usa luego para adjuntarlo al correo de confirmación (fusionado).
export const crearFactura = async (pedido) => {
  try {
    const anio = new Date().getFullYear()
    const numero = `EVA-${anio}-${String(pedido.id_pedido).padStart(6, "0")}`

    const bufferPDF = await generarFacturaPDF(pedido, numero)
    const url_pdf = await subirPDFaCloudinary(bufferPDF, numero)

    const factura = await prisma.factura.create({
      data: { id_pedido: pedido.id_pedido, numero, url_pdf },
    })

    return { factura, bufferPDF, numero }
  } catch (error) {
    console.error("Error generando factura:", error)
    return null
  }
}

// GET /api/cliente/facturas
// GET /api/cliente/facturas
export const listarFacturasCliente = async (req, res) => {
  try {
    const facturas = await prisma.factura.findMany({
      where: { pedido: { id_cliente: req.user.id }, activa: true },
      include: {
        pedido: {
          select: {
            id_pedido: true, total: true, fecha: true, estado: true,
            detalles: { include: { producto: { select: { nombre_producto: true } } } },
            seccion: { include: { emprendedora: { include: { usuario: { select: { nombre: true } } } } } },
            pago: { select: { metodo: true } },
          },
        },
      },
      orderBy: { fecha_emision: "desc" },
    })
    res.json(facturas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener facturas" })
  }
}

// GET /api/emprendedora/facturas
export const listarFacturasEmprendedora = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: { secciones: true },
    })
    if (!emprendedora) return res.status(404).json({ error: "Emprendedora no encontrada" })

    const idSecciones = emprendedora.secciones.map((s) => s.id_seccion)

    const facturas = await prisma.factura.findMany({
      where: { pedido: { id_seccion: { in: idSecciones } }, activa: true },
      include: {
        pedido: {
          select: { id_pedido: true, total: true, fecha: true, cliente: { select: { nombre: true } } },
        },
      },
      orderBy: { fecha_emision: "desc" },
    })
    res.json(facturas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener facturas" })
  }
}

// GET /api/admin/facturas
export const listarFacturasAdmin = async (req, res) => {
  try {
    const facturas = await prisma.factura.findMany({
      include: {
        pedido: {
          select: {
            id_pedido: true, total: true, fecha: true,
            cliente: { select: { nombre: true, email: true } },
            seccion: { include: { emprendedora: { include: { usuario: { select: { nombre: true } } } } } },
          },
        },
      },
      orderBy: { fecha_emision: "desc" },
    })
    res.json(facturas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener facturas" })
  }
}

// PUT /api/admin/facturas/:id/regenerar — RN-050: admin corrige, dejando registro del motivo
export const regenerarFactura = async (req, res) => {
  try {
    const id_factura = Number(req.params.id)
    const { motivo } = req.body
    if (!motivo) return res.status(400).json({ error: "Debes indicar el motivo de la regeneración" })

    const facturaActual = await prisma.factura.findUnique({
      where: { id_factura },
      include: {
        pedido: {
          include: {
            cliente: { select: { nombre: true, email: true } },
            detalles: { include: { producto: { select: { nombre_producto: true } } } },
            seccion: { include: { emprendedora: { include: { usuario: { select: { nombre: true } } } } } },
          },
        },
      },
    })
    if (!facturaActual) return res.status(404).json({ error: "Factura no encontrada" })

    const bufferPDF = await generarFacturaPDF(facturaActual.pedido, facturaActual.numero)
    const url_pdf = await subirPDFaCloudinary(bufferPDF, `${facturaActual.numero}-v2`)

    const factura = await prisma.factura.update({
      where: { id_factura },
      data: { url_pdf, nota_regeneracion: motivo, fecha_emision: new Date() },
    })

    // Registro en auditoría general del sistema
    await prisma.auditoria.create({
      data: {
        id_usuario_accion: req.user.id,
        id_registro: id_factura,
        tabla_afectada: "facturas",
        accion: "regenerada",
        fecha: new Date(),
        detalles: motivo,
      },
    })

    res.json({ message: "Factura regenerada", factura })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al regenerar factura" })
  }
}