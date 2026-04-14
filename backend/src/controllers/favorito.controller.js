import prisma from '../conexion.js'

// POST /api/favoritos/:id_producto — agregar/quitar favorito (toggle)
export const toggleFavorito = async (req, res) => {
  try {
    const id_usuario  = req.user.id
    const id_producto = Number(req.params.id_producto)

    const existe = await prisma.favorito.findUnique({
      where: { id_usuario_id_producto: { id_usuario, id_producto } }
    })

    if (existe) {
      await prisma.favorito.delete({
        where: { id_usuario_id_producto: { id_usuario, id_producto } }
      })
      return res.json({ favorito: false })
    } else {
      await prisma.favorito.create({ data: { id_usuario, id_producto } })
      return res.json({ favorito: true })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar favorito' })
  }
}

// GET /api/favoritos — favoritos del usuario cliente
export const listarFavoritos = async (req, res) => {
  try {
    const favoritos = await prisma.favorito.findMany({
      where: { id_usuario: req.user.id },
      include: {
        producto: {
          include: {
            inventario: true,
            seccion: {
              include: {
                emprendedora: { include: { usuario: { select: { nombre: true } } } }
              }
            }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    })
    res.json(favoritos.map(f => f.producto))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener favoritos' })
  }
}

// GET /api/favoritos/tienda — productos favoritos de la tienda de la emprendedora
export const favoritosTienda = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: { secciones: { select: { id_seccion: true } } }
    })
    if (!emprendedora) return res.status(404).json({ error: 'No encontrada' })

    const idSecciones = emprendedora.secciones.map(s => s.id_seccion)

    const productos = await prisma.producto.findMany({
      where: {
        id_seccion: { in: idSecciones },
        estado_producto: 'activo',
        favoritos: { some: {} }
      },
      include: {
        inventario: true,
        favoritos: true,
        _count: { select: { favoritos: true } }
      },
      orderBy: { favoritos: { _count: 'desc' } }
    })

    res.json(productos.map(p => ({
      ...p,
      total_favoritos: p._count.favoritos
    })))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener favoritos de tienda' })
  }
}

// GET /api/favoritos/check/:id_producto — verificar si es favorito
export const checkFavorito = async (req, res) => {
  try {
    const favorito = await prisma.favorito.findUnique({
      where: {
        id_usuario_id_producto: {
          id_usuario: req.user.id,
          id_producto: Number(req.params.id_producto)
        }
      }
    })
    res.json({ favorito: !!favorito })
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar favorito' })
  }
}