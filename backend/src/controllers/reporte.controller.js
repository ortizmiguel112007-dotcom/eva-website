import prisma from "../conexion.js"

// Construye el reporte agregado a partir de un filtro de productos (por id_producto)
const construirReporte = async (idsProducto) => {
  const comentarios = await prisma.comentario.findMany({
    where: { id_producto: { in: idsProducto }, activo: true },
    include: {
      producto: { select: { id_producto: true, nombre_producto: true } },
    },
  })

  const totalComentarios = comentarios.length
  const promedioGlobal = totalComentarios
    ? Number((comentarios.reduce((acc, c) => acc + c.calificacion, 0) / totalComentarios).toFixed(2))
    : 0

  const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  comentarios.forEach((c) => { distribucion[c.calificacion] = (distribucion[c.calificacion] || 0) + 1 })

  // Agrupar por producto
  const porProductoMap = {}
  comentarios.forEach((c) => {
    const key = c.id_producto
    if (!porProductoMap[key]) {
      porProductoMap[key] = {
        id_producto: key,
        nombre_producto: c.producto?.nombre_producto || "—",
        total: 0,
        suma: 0,
      }
    }
    porProductoMap[key].total += 1
    porProductoMap[key].suma += c.calificacion
  })

  const porProducto = Object.values(porProductoMap)
    .map((p) => ({
      id_producto: p.id_producto,
      nombre_producto: p.nombre_producto,
      total_comentarios: p.total,
      promedio: Number((p.suma / p.total).toFixed(2)),
    }))
    .sort((a, b) => b.total_comentarios - a.total_comentarios)

  const mejorCalificado = [...porProducto].sort((a, b) => b.promedio - a.promedio)[0] || null
  const peorCalificado = [...porProducto].sort((a, b) => a.promedio - b.promedio)[0] || null

  // Tasa de conversión: pedidos entregados vs pedidos con al menos un comentario
  const pedidosEntregados = await prisma.pedido.findMany({
    where: {
      estado: "entregado",
      detalles: { some: { id_producto: { in: idsProducto } } },
    },
    select: { id_pedido: true, comentarios: { select: { id_comentario: true } } },
  })

  const totalEntregados = pedidosEntregados.length
  const conResena = pedidosEntregados.filter((p) => p.comentarios.length > 0).length
  const tasaConversion = totalEntregados ? Number(((conResena / totalEntregados) * 100).toFixed(1)) : 0

  // Clientes distintos que han dejado reseña
  const clientesUnicos = new Set(comentarios.map((c) => c.id_usuario)).size

  return {
    resumen: {
      total_comentarios: totalComentarios,
      promedio_global: promedioGlobal,
      distribucion_estrellas: distribucion,
      clientes_que_resenaron: clientesUnicos,
    },
    por_producto: porProducto,
    mejor_calificado: mejorCalificado,
    peor_calificado: peorCalificado,
    conversion: {
      pedidos_entregados: totalEntregados,
      pedidos_con_resena: conResena,
      tasa_porcentaje: tasaConversion,
    },
  }
}

// GET /api/emprendedora/reportes/retroalimentacion — reporte filtrado a sus productos (RF-049)
export const reporteEmprendedora = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: { secciones: { include: { productos: { select: { id_producto: true } } } } },
    })
    if (!emprendedora) return res.status(404).json({ error: "Emprendedora no encontrada" })

    const idsProducto = emprendedora.secciones.flatMap((s) => s.productos.map((p) => p.id_producto))
    const reporte = await construirReporte(idsProducto)
    res.json(reporte)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al generar reporte" })
  }
}

// GET /api/admin/reportes/retroalimentacion — reporte de toda la plataforma (RF-049)
export const reporteAdmin = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({ select: { id_producto: true } })
    const idsProducto = productos.map((p) => p.id_producto)
    const reporte = await construirReporte(idsProducto)
    res.json(reporte)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al generar reporte" })
  }
}