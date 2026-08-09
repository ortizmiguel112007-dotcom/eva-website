import PDFDocument from "pdfkit"

// Construye el PDF de la factura en memoria y lo devuelve como Buffer
export const generarFacturaPDF = (pedido, numero) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    const formatPrecio = (p) => "$" + Number(p).toLocaleString("es-CO")
    const formatFecha = (f) =>
      new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })

    doc.fontSize(20).fillColor("#1e293b").text("EVA Marketplace", { align: "left" })
    doc.fontSize(10).fillColor("#64748b").text("Comprobante de venta digital", { align: "left" })
    doc.moveDown(1)

    doc.fontSize(14).fillColor("#1e293b").text(`Factura ${numero}`, { align: "right" })
    doc.fontSize(9).fillColor("#94a3b8").text(`Emitida el ${formatFecha(new Date())}`, { align: "right" })
    doc.moveDown(1.5)

    doc.fontSize(11).fillColor("#1e293b").text("Datos del cliente", { underline: true })
    doc.fontSize(10).fillColor("#475569")
    doc.text(`Nombre: ${pedido.cliente?.nombre || "—"}`)
    doc.text(`Correo: ${pedido.cliente?.email || "—"}`)
    doc.moveDown(1)

    doc.fontSize(11).fillColor("#1e293b").text("Datos del pedido", { underline: true })
    doc.fontSize(10).fillColor("#475569")
    doc.text(`Pedido #${pedido.id_pedido}`)
    doc.text(`Fecha de compra: ${formatFecha(pedido.fecha)}`)
    doc.text(`Tienda: ${pedido.seccion?.emprendedora?.usuario?.nombre || "EVA"}`)
    doc.moveDown(1)

    doc.fontSize(11).fillColor("#1e293b").text("Productos adquiridos", { underline: true })
    doc.moveDown(0.5)

    const startX = 50
    let y = doc.y
    doc.fontSize(9).fillColor("#94a3b8")
    doc.text("Producto", startX, y)
    doc.text("Cant.", 320, y)
    doc.text("Precio unit.", 380, y)
    doc.text("Subtotal", 470, y)
    y += 15
    doc.moveTo(startX, y).lineTo(545, y).strokeColor("#e5e7eb").stroke()
    y += 8

    doc.fontSize(9).fillColor("#1e293b")
    for (const d of pedido.detalles || []) {
      const subtotal = Number(d.precio_unit) * d.cantidad
      doc.text(d.producto?.nombre_producto || "Producto", startX, y, { width: 260 })
      doc.text(String(d.cantidad), 320, y)
      doc.text(formatPrecio(d.precio_unit), 380, y)
      doc.text(formatPrecio(subtotal), 470, y)
      y += 20
    }

    y += 5
    doc.moveTo(startX, y).lineTo(545, y).strokeColor("#e5e7eb").stroke()
    y += 10

    doc.fontSize(12).fillColor("#1e293b").text("Total", 380, y, { continued: false })
    doc.fontSize(12).fillColor("#2563eb").text(formatPrecio(pedido.total), 470, y)

    doc.moveDown(3)
    doc.fontSize(8).fillColor("#94a3b8").text(
      "Este documento es un comprobante de venta digital generado automáticamente por EVA Marketplace con fines informativos y de registro interno. No constituye una factura electrónica válida ante la DIAN.",
      { align: "center" }
    )

    doc.end()
  })
}