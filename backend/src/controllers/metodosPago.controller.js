import prisma from "../conexion.js"

// GET /api/emprendedora/metodos-pago — obtener métodos configurados
export const obtenerMetodosPago = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      select: {
        nequi_numero:         true,
        bancolombia_numero:   true,
        bancolombia_tipo:     true,
        titular_cuenta:       true,
        acepta_contraentrega: true,
      }
    })
    if (!emprendedora) return res.status(404).json({ error: "Emprendedora no encontrada" })
    res.json(emprendedora)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error al obtener métodos de pago" })
  }
}

// PUT /api/emprendedora/metodos-pago — actualizar métodos configurados
export const actualizarMetodosPago = async (req, res) => {
  try {
    const {
      nequi_numero,
      bancolombia_numero,
      bancolombia_tipo,
      titular_cuenta,
      acepta_contraentrega,
    } = req.body

    const emprendedora = await prisma.emprendedora.update({
      where: { id_usuario: req.user.id },
      data: {
        nequi_numero:         nequi_numero         || null,
        bancolombia_numero:   bancolombia_numero   || null,
        bancolombia_tipo:     bancolombia_tipo     || null,
        titular_cuenta:       titular_cuenta       || null,
        acepta_contraentrega: acepta_contraentrega ?? false,
      }
    })
    res.json({ message: "Métodos de pago actualizados", emprendedora })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error al actualizar métodos de pago" })
  }
}

// GET /api/tienda/:id_emprendedora/metodos-pago — obtener métodos de una tienda (público)
export const obtenerMetodosPagoPublico = async (req, res) => {
  try {
    const id_emprendedora = Number(req.params.id_emprendedora)
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_emprendedora },
      select: {
        nequi_numero:         true,
        bancolombia_numero:   true,
        bancolombia_tipo:     true,
        titular_cuenta:       true,
        acepta_contraentrega: true,
      }
    })
    if (!emprendedora) return res.status(404).json({ error: "Emprendedora no encontrada" })
    res.json(emprendedora)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error al obtener métodos de pago" })
  }
}

// GET /api/admin/metodos-pago — configuración de plataforma (solo admin)
export const obtenerConfigAdmin = async (req, res) => {
  try {
    let config = await prisma.configuracionPago.findUnique({ where: { id: 1 } })
    if (!config) {
      config = await prisma.configuracionPago.create({
        data: { id: 1, acepta_contraentrega: true },
      })
    }
    res.json(config)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error al obtener configuración de pago" })
  }
}

// PUT /api/admin/metodos-pago — actualizar configuración de plataforma (solo admin)
export const actualizarConfigAdmin = async (req, res) => {
  try {
    const {
      nequi_numero,
      bancolombia_numero,
      bancolombia_tipo,
      titular_cuenta,
      acepta_contraentrega,
    } = req.body

    const config = await prisma.configuracionPago.upsert({
      where: { id: 1 },
      update: {
        nequi_numero:         nequi_numero         || null,
        bancolombia_numero:   bancolombia_numero   || null,
        bancolombia_tipo:     bancolombia_tipo     || null,
        titular_cuenta:       titular_cuenta       || null,
        acepta_contraentrega: acepta_contraentrega ?? false,
      },
      create: {
        id: 1,
        nequi_numero:         nequi_numero         || null,
        bancolombia_numero:   bancolombia_numero   || null,
        bancolombia_tipo:     bancolombia_tipo     || null,
        titular_cuenta:       titular_cuenta       || null,
        acepta_contraentrega: acepta_contraentrega ?? false,
      },
    })
    res.json({ message: "Configuración de pago actualizada", config })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error al actualizar configuración de pago" })
  }
}

// GET /api/metodos-pago/eva — configuración pública para el checkout del cliente
export const obtenerConfigPublica = async (req, res) => {
  try {
    const config = await prisma.configuracionPago.findUnique({ where: { id: 1 } })
    if (!config) {
      return res.json({
        nequi_numero: null, bancolombia_numero: null,
        bancolombia_tipo: null, titular_cuenta: null,
        acepta_contraentrega: true,
      })
    }
    res.json(config)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error al obtener métodos de pago" })
  }
}