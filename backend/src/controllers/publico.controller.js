import prisma from '../conexion.js'

// GET /api/publico/destacados — productos destacados
export const getDestacados = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { destacado: true, estado_producto: 'activo' },
      include: {
        seccion: {
          include: {
            emprendedora: {
              include: { usuario: { select: { nombre: true } } }
            }
          }
        },
        inventario: true
      },
      take: 8,
      orderBy: { ultima_modificacion_stock: 'desc' }
    })
    res.json(productos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener destacados' })
  }
}

// GET /api/publico/productos — catálogo completo
export const getCatalogo = async (req, res) => {
  try {
    const { busqueda, categoria, tipo } = req.query
    const productos = await prisma.producto.findMany({
      where: {
        estado_producto: 'activo',
        ...(categoria && { categoria }),
        ...(tipo && { tipo }),
        ...(busqueda && {
          nombre_producto: { contains: busqueda, mode: 'insensitive' }
        })
      },
      include: {
        seccion: {
          include: {
            emprendedora: {
              include: { usuario: { select: { nombre: true } } }
            }
          }
        },
        inventario: true
      },
      orderBy: { ultima_modificacion_stock: 'desc' }
    })
    res.json(productos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener catálogo' })
  }
}

// GET /api/publico/tiendas — emprendedoras activas con sus productos
export const getTiendas = async (req, res) => {
  try {
    const emprendedoras = await prisma.emprendedora.findMany({
      where: { estado: true, usuario: { activo: true } },
      include: {
        usuario: { select: { nombre: true } },
        secciones: {
          include: {
            productos: {
              where: { estado_producto: 'activo' },
              take: 4,
              orderBy: { ultima_modificacion_stock: 'desc' }
            }
          }
        }
      }
    })
    res.json(emprendedoras)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener tiendas' })
  }
}