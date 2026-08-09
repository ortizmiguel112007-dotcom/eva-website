import prisma from "../conexion.js"
import { crearNotificacion } from "./notificacion.controller.js"

// GET /api/admin/liquidaciones — todas las liquidaciones (admin)
export const listarLiquidacionesAdmin = async (req, res) => {
  try {
    const liquidaciones = await prisma.liquidacion.findMany({
      include: {
        pedido: { select: { id_pedido: true, total: true, fecha: true } },
        emprendedora: {
          select: {
            id_emprendedora: true,
            nequi_numero: true,
            bancolombia_numero: true,
            bancolombia_tipo: true,
            titular_cuenta: true,
            usuario: { select: { nombre: true, email: true } },
          },
        },
      },
      orderBy: { fecha_generada: "desc" },
    })
    res.json(liquidaciones)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener liquidaciones" })
  }
}

// GET /api/emprendedora/liquidaciones — liquidaciones de la emprendedora logueada
export const listarLiquidacionesEmprendedora = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
    })
    if (!emprendedora) return res.status(404).json({ error: "Emprendedora no encontrada" })

    const liquidaciones = await prisma.liquidacion.findMany({
      where: { id_emprendedora: emprendedora.id_emprendedora },
      include: { pedido: { select: { id_pedido: true, total: true, fecha: true } } },
      orderBy: { fecha_generada: "desc" },
    })
    res.json(liquidaciones)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener liquidaciones" })
  }
}

// PUT /api/admin/liquidaciones/:id/pagar — admin marca una liquidación como pagada
export const marcarLiquidacionPagada = async (req, res) => {
  try {
    const id_liquidacion = Number(req.params.id)
    const { nota } = req.body

    const liquidacionActual = await prisma.liquidacion.findUnique({
      where: { id_liquidacion },
      include: { emprendedora: { include: { usuario: true } } },
    })
    if (!liquidacionActual) return res.status(404).json({ error: "Liquidación no encontrada" })
    if (liquidacionActual.estado === "pagado")
      return res.status(400).json({ error: "Esta liquidación ya fue pagada" })

    const liquidacion = await prisma.liquidacion.update({
      where: { id_liquidacion },
      data: { estado: "pagado", fecha_pagado: new Date(), nota: nota || null },
    })

    await crearNotificacion(
      liquidacionActual.emprendedora.usuario.id,
      "liquidacion",
      "Pago recibido",
      `Recibiste $${Number(liquidacionActual.monto).toLocaleString("es-CO")} por tu venta del pedido #${liquidacionActual.id_pedido}.`,
      "/mis-liquidaciones",
    )

    res.json({ message: "Liquidación marcada como pagada", liquidacion })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al actualizar liquidación" })
  }
}

// POST /api/admin/liquidaciones/backfill — genera liquidaciones faltantes para pagos ya aprobados
export const backfillLiquidaciones = async (req, res) => {
  try {
    const pedidosAprobadosSinLiquidacion = await prisma.pedido.findMany({
      where: {
        estado: "en_proceso",
        pago: { estado: "aprobado" },
        liquidacion: null,
      },
      include: {
        seccion: { include: { emprendedora: true } },
      },
    })

    let creadas = 0
    for (const pedido of pedidosAprobadosSinLiquidacion) {
      const idEmprendedora = pedido.seccion?.emprendedora?.id_emprendedora
      if (idEmprendedora) {
        await prisma.liquidacion.create({
          data: {
            id_pedido: pedido.id_pedido,
            id_emprendedora: idEmprendedora,
            monto: pedido.total,
            estado: "pendiente",
          },
        })
        creadas++
      }
    }

    res.json({ message: `${creadas} liquidación(es) generada(s)`, creadas })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al generar liquidaciones" })
  }
}