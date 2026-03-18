import prisma from '../conexion.js'

// GET /api/destacados — productos destacados de la emprendedora
export const listarDestacados = async (req, res) => {
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
    res.json(productos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener productos' })
  }
}

// PUT /api/destacados/:id — toggle destacado
export const toggleDestacado = async (req, res) => {
  try {
    const id_producto = Number(req.params.id)

    const producto = await prisma.producto.findUnique({ where: { id_producto } })
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })

    const actualizado = await prisma.producto.update({
      where: { id_producto },
      data: { destacado: !producto.destacado }
    })

    res.json({ message: `Producto ${actualizado.destacado ? 'destacado' : 'quitado de destacados'}`, producto: actualizado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar destacado' })
  }
}