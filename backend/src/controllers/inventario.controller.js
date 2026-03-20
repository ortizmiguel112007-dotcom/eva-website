import prisma from '../conexion.js'

// GET /api/inventario — inventario de la emprendedora logueada
export const listarInventario = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: {
        secciones: {
          include: {
            productos: {
              where: { estado_producto: 'activo' },
              include: { inventario: true }
            }
          }
        }
      }
    })

    if (!emprendedora) return res.status(404).json({ error: 'Emprendedora no encontrada' })

    const productos = emprendedora.secciones.flatMap(s => s.productos)

    const inventario = productos.map(p => ({
      id_producto:    p.id_producto,
      nombre:         p.nombre_producto,
      categoria:      p.categoria,
      tipo:           p.tipo,
      precio:         p.precio,
      imagen:         p.imagen,
      cantidad:       p.inventario?.cantidad ?? 0,
      stock_minimo:   p.inventario?.stock_minimo ?? p.stock_minimo,
      stock_maximo:   p.inventario?.stock_maximo ?? 100,
      alerta:         (p.inventario?.cantidad ?? 0) <= (p.inventario?.stock_minimo ?? p.stock_minimo),
    }))

    res.json(inventario)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener inventario' })
  }
}

// PUT /api/inventario/:id — actualizar stock de un producto
export const actualizarStock = async (req, res) => {
  try {
    const id_producto = Number(req.params.id)
    const { cantidad, stock_minimo, stock_maximo } = req.body

    if (cantidad < 0) return res.status(400).json({ error: 'La cantidad no puede ser negativa' })

    const inventario = await prisma.inventario.update({
      where: { id_producto },
      data: {
        ...(cantidad    !== undefined && { cantidad:     Number(cantidad) }),
        ...(stock_minimo !== undefined && { stock_minimo: Number(stock_minimo) }),
        ...(stock_maximo !== undefined && { stock_maximo: Number(stock_maximo) }),
      }
    })

    res.json({ message: 'Stock actualizado', inventario })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar stock' })
  }
}