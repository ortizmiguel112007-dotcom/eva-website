import prisma from '../conexion.js'
import PDFDocument from "pdfkit"
import * as XLSX from "xlsx"
import { soloEmprendedoraActiva } from '../utils/filtroEmprendedoraActiva.js'

const registrarLog = async (id_producto, evento, id_usuario = null, detalle = null) => {
  try {
    await prisma.destacadoLog.create({ data: { id_producto, evento, id_usuario, detalle } })
  } catch (err) { console.error("Error registrando DestacadoLog:", err) }
}

// GET /api/destacados — productos de la emprendedora, con su estado real (RF-082/RN-070)
export const listarDestacados = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: {
        secciones: {
          include: { productos: { where: { estado_producto: 'activo' }, include: { inventario: true } } }
        }
      }
    })
    if (!emprendedora) return res.status(404).json({ error: 'Emprendedora no encontrada' })

    const productos = emprendedora.secciones.flatMap(s => s.productos)
    res.json(productos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener productos' })
  }
}

// POST /api/destacados/:id/solicitar — emprendedora propone su producto (RF-075)
export const solicitarDestacado = async (req, res) => {
  try {
    const id_producto = Number(req.params.id)
    const { categoria } = req.body

    const producto = await prisma.producto.findUnique({
      where: { id_producto },
      include: { seccion: { include: { emprendedora: true } } },
    })
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })

    // RF-082/RN-070: solo el dueño puede solicitar
    const emprendedora = await prisma.emprendedora.findUnique({ where: { id_usuario: req.user.id } })
    if (producto.seccion?.id_emprendedora !== emprendedora?.id_emprendedora)
      return res.status(403).json({ error: 'No autorizado' })

    // RN-063: solo productos activos
    if (producto.estado_producto !== 'activo')
      return res.status(400).json({ error: 'Solo productos activos pueden solicitarse como destacados' })

    if (producto.destacado)
      return res.status(400).json({ error: 'Este producto ya está destacado' })
    if (producto.solicitud_pendiente)
      return res.status(400).json({ error: 'Ya tienes una solicitud pendiente para este producto' })

    const actualizado = await prisma.producto.update({
      where: { id_producto },
      data: {
        solicitud_pendiente: true,
        categoria_destacado: categoria || null,
        fecha_solicitud: new Date(),
      },
    })

    await registrarLog(id_producto, 'solicitado', req.user.id, categoria ? `Categoría: ${categoria}` : null)

    res.json({ message: 'Solicitud enviada, pendiente de aprobación', producto: actualizado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al solicitar destacado' })
  }
}

// PUT /api/admin/destacados/:id/aprobar — RN-071
export const aprobarDestacado = async (req, res) => {
  try {
    const id_producto = Number(req.params.id)
    const producto = await prisma.producto.findUnique({ where: { id_producto } })
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
    if (!producto.solicitud_pendiente)
      return res.status(400).json({ error: 'No hay solicitud pendiente para este producto' })

    const actualizado = await prisma.producto.update({
      where: { id_producto },
      data: { destacado: true, solicitud_pendiente: false, fecha_decision: new Date() },
    })

    await registrarLog(id_producto, 'aprobado', req.user.id)
    res.json({ message: 'Destacado aprobado', producto: actualizado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al aprobar destacado' })
  }
}

// PUT /api/admin/destacados/:id/rechazar — RN-071
export const rechazarDestacado = async (req, res) => {
  try {
    const id_producto = Number(req.params.id)
    const { motivo } = req.body

    const actualizado = await prisma.producto.update({
      where: { id_producto },
      data: { solicitud_pendiente: false, categoria_destacado: null, fecha_decision: new Date() },
    })

    await registrarLog(id_producto, 'rechazado', req.user.id, motivo || null)
    res.json({ message: 'Solicitud rechazada', producto: actualizado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al rechazar destacado' })
  }
}

// PUT /api/admin/destacados/:id/desactivar — RN-071 ("eliminar")
export const desactivarDestacado = async (req, res) => {
  try {
    const id_producto = Number(req.params.id)
    const { motivo } = req.body

    const actualizado = await prisma.producto.update({
      where: { id_producto },
      data: { destacado: false, categoria_destacado: null },
    })

    await registrarLog(id_producto, 'desactivado', req.user.id, motivo || null)
    res.json({ message: 'Destacado desactivado', producto: actualizado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al desactivar destacado' })
  }
}

// GET /api/admin/destacados — todas las solicitudes/destacados de la plataforma (RF-083)
export const listarDestacadosAdmin = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { OR: [{ destacado: true }, { solicitud_pendiente: true }] },
      include: {
        seccion: { include: { emprendedora: { include: { usuario: { select: { nombre: true } } } } } },
        inventario: true,
      },
      orderBy: { fecha_solicitud: 'desc' },
    })
    res.json(productos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener destacados' })
  }
}

// GET /api/destacados/publico — RF-076/RF-081: catálogo público, solo aprobados + con stock
export const listarDestacadosPublico = async (req, res) => {
  try {
    const { categoria } = req.query // RF-077
    const productos = await prisma.producto.findMany({
      where: {
        destacado: true,
        estado_producto: 'activo',
        visible: true,
        ...soloEmprendedoraActiva,
        inventario: { cantidad: { gt: 0 } },
        ...(categoria ? { categoria_destacado: categoria } : {}),
      },
      include: { inventario: true, seccion: { include: { emprendedora: { include: { usuario: { select: { nombre: true } } } } } } },
    })
    res.json(productos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener destacados' })
  }
}

// GET /api/admin/destacados/config — RN-065
export const obtenerConfigDestacados = async (req, res) => {
  try {
    let config = await prisma.configuracionDestacados.findFirst()
    if (!config) config = await prisma.configuracionDestacados.create({ data: {} })
    res.json(config)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener configuración' })
  }
}

// PUT /api/admin/destacados/config — RN-065
export const actualizarConfigDestacados = async (req, res) => {
  try {
    const { dias_nuevo, top_mas_vendidos } = req.body
    let config = await prisma.configuracionDestacados.findFirst()
    if (!config) config = await prisma.configuracionDestacados.create({ data: {} })

    const actualizado = await prisma.configuracionDestacados.update({
      where: { id: config.id },
      data: { dias_nuevo, top_mas_vendidos },
    })
    res.json({ message: 'Configuración actualizada', config: actualizado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar configuración' })
  }
}

// GET /api/admin/destacados/:id/historial — RF-079
export const historialDestacado = async (req, res) => {
  try {
    const logs = await prisma.destacadoLog.findMany({
      where: { id_producto: Number(req.params.id) },
      include: { usuario: { select: { nombre: true, rol: true } } },
      orderBy: { fecha: 'asc' },
    })
    res.json(logs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener historial' })
  }
}

// POST /api/destacados/:id/evento — tracking de clic/visita (RF-080), público
export const registrarEvento = async (req, res) => {
  try {
    const id_producto = Number(req.params.id)
    const { tipo } = req.body
    if (!['visita', 'clic'].includes(tipo))
      return res.status(400).json({ error: 'Tipo de evento inválido' })

    await prisma.destacadoEvento.create({ data: { id_producto, tipo } })
    res.status(201).json({ message: 'Evento registrado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al registrar evento' })
  }
}

// Construye métricas agregadas (compartido por reporte y export) — RF-080
const construirMetricas = async (idsProducto) => {
  const eventos = await prisma.destacadoEvento.findMany({
    where: { id_producto: { in: idsProducto } },
    include: { producto: { select: { nombre_producto: true } } },
  })

  const conversiones = await prisma.detallePedido.groupBy({
    by: ['id_producto'],
    where: { id_producto: { in: idsProducto } },
    _count: { id_producto: true },
  })

  const mapa = {}
  idsProducto.forEach((id) => { mapa[id] = { visitas: 0, clics: 0, conversiones: 0, nombre: '' } })
  eventos.forEach((e) => {
    if (!mapa[e.id_producto]) return
    mapa[e.id_producto].nombre = e.producto?.nombre_producto || ''
    if (e.tipo === 'visita') mapa[e.id_producto].visitas++
    if (e.tipo === 'clic') mapa[e.id_producto].clics++
  })
  conversiones.forEach((c) => {
    if (mapa[c.id_producto]) mapa[c.id_producto].conversiones = c._count.id_producto
  })

  return Object.entries(mapa).map(([id_producto, datos]) => ({ id_producto: Number(id_producto), ...datos }))
}

// GET /api/emprendedora/destacados/metricas — RF-080
export const metricasEmprendedora = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: { secciones: { include: { productos: { where: { destacado: true }, select: { id_producto: true } } } } },
    })
    if (!emprendedora) return res.status(404).json({ error: 'Emprendedora no encontrada' })

    const ids = emprendedora.secciones.flatMap((s) => s.productos.map((p) => p.id_producto))
    res.json(await construirMetricas(ids))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener métricas' })
  }
}

// GET /api/admin/destacados/metricas — RF-080
export const metricasAdmin = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({ where: { destacado: true }, select: { id_producto: true } })
    res.json(await construirMetricas(productos.map((p) => p.id_producto)))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener métricas' })
  }
}

// GET /api/admin/destacados/metricas/export?formato=pdf|excel — RN-068
export const exportarMetricas = async (req, res) => {
  try {
    const formato = req.query.formato === 'excel' ? 'excel' : 'pdf'
    const productos = await prisma.producto.findMany({ where: { destacado: true }, select: { id_producto: true } })
    const metricas = await construirMetricas(productos.map((p) => p.id_producto))

    if (formato === 'excel') {
      const hoja = XLSX.utils.json_to_sheet(
        metricas.map((m) => ({
          Producto: m.nombre, Visitas: m.visitas, Clics: m.clics, Conversiones: m.conversiones,
        })),
      )
      const libro = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(libro, hoja, "Métricas")
      const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" })

      res.setHeader("Content-Disposition", "attachment; filename=metricas_destacados.xlsx")
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      return res.send(buffer)
    }

    // PDF
    const doc = new PDFDocument({ margin: 40 })
    res.setHeader("Content-Disposition", "attachment; filename=metricas_destacados.pdf")
    res.setHeader("Content-Type", "application/pdf")
    doc.pipe(res)

    doc.fontSize(16).text("Métricas de Productos Destacados", { align: "center" })
    doc.moveDown(1)
    metricas.forEach((m) => {
      doc.fontSize(11).text(`${m.nombre || "Producto #" + m.id_producto}`)
      doc.fontSize(9).fillColor("#64748b")
        .text(`Visitas: ${m.visitas}   Clics: ${m.clics}   Conversiones: ${m.conversiones}`)
      doc.fillColor("#000").moveDown(0.7)
    })
    doc.end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al exportar métricas' })
  }
}

// Job automático — RF-078/RN-066: recalcula categorías "nuevos" y "más vendidos"
export const actualizarCategoriasAutomaticas = async () => {
  try {
    let config = await prisma.configuracionDestacados.findFirst()
    if (!config) config = await prisma.configuracionDestacados.create({ data: {} })

    const fechaLimite = new Date(Date.now() - config.dias_nuevo * 24 * 60 * 60 * 1000)

    // "nuevos": productos activos creados dentro del umbral, sin categoría manual asignada
    const nuevos = await prisma.producto.findMany({
      where: { estado_producto: 'activo', destacado: true, categoria_destacado: null },
      select: { id_producto: true },
    })

    // Top vendidos (por cantidad total en DetallePedido)
    const ventas = await prisma.detallePedido.groupBy({
      by: ['id_producto'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: config.top_mas_vendidos,
    })
    const idsTopVendidos = ventas.map((v) => v.id_producto)

    if (idsTopVendidos.length > 0) {
      await prisma.producto.updateMany({
        where: { id_producto: { in: idsTopVendidos }, destacado: true },
        data: { categoria_destacado: 'mas_vendidos' },
      })
    }

    console.log(`[destacados] Categorías automáticas actualizadas: ${idsTopVendidos.length} productos marcados como más vendidos`)
  } catch (err) {
    console.error("Error en actualización automática de destacados:", err)
  }
}