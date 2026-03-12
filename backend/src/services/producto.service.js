import prisma from '../conexion.js'

export const productoService = {
  async crear(data) {
    return prisma.producto.create({
      data: {
        id_seccion:      data.id_seccion,
        nombre_producto: data.nombre_producto,
        descripcion:     data.descripcion,
        precio:          data.precio,
        categoria:       data.categoria,
        imagen:          data.imagen,
        tamano_imagen:   data.tamano_imagen,
        stock_minimo:    data.stock_minimo ?? 0,
      },
      include: { inventario: true },
    })
  },

  async obtenerPorSeccion(id_seccion, categoria) {
    return prisma.producto.findMany({
      where: {
        id_seccion,
        estado_producto: 'activo',
        ...(categoria && { categoria }),
      },
      include: { inventario: true },
      orderBy: { nombre_producto: 'asc' },
    })
  },

  async obtenerPorId(id_producto) {
    return prisma.producto.findUnique({
      where: { id_producto },
      include: { inventario: true, seccion: true },
    })
  },

  async actualizar(id_producto, data) {
    return prisma.producto.update({
      where: { id_producto },
      data,
      include: { inventario: true },
    })
  },

  async eliminar(id_producto) {
    return prisma.producto.update({
      where: { id_producto },
      data: { estado_producto: 'inactivo' },
    })
  },
}