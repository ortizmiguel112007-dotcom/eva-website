import prisma from "../conexion.js";
import { aplicarDescuento } from './reglasdescuento.controller.js'
import { soloEmprendedoraActiva } from '../utils/filtroEmprendedoraActiva.js'

// GET /api/publico/destacados — productos destacados
export const getDestacados = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { destacado: true, estado_producto: "activo", visible: true, ...soloEmprendedoraActiva },
      include: {
        seccion: {
          include: {
            emprendedora: {
              include: { usuario: { select: { nombre: true } } },
            },
          },
        },
        inventario: true,
      },
      take: 8,
      orderBy: { ultima_modificacion_stock: "desc" },
    });
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener destacados" });
  }
};

// GET /api/publico/productos — catálogo completo
export const getCatalogo = async (req, res) => {
  try {
    const { busqueda, categoria, tipo } = req.query;
    const productos = await prisma.producto.findMany({
      where: {
        estado_producto: "activo",
        visible: true,
        ...soloEmprendedoraActiva,
        ...(categoria && { categoria }),
        ...(tipo && { tipo }),
        ...(busqueda && {
          nombre_producto: { contains: busqueda, mode: "insensitive" },
        }),
      },
      include: {
        seccion: {
          include: {
            emprendedora: {
              include: { usuario: { select: { nombre: true } } },
            },
            alianza: {
              include: {
                participantes: {
                  include: {
                    usuario: { select: { nombre: true } },
                  },
                },
              },
            },
          },
        },
        inventario: true,
        comentarios: true,
      },
      orderBy: { ultima_modificacion_stock: "desc" },
    });
     // Aplicar descuentos
    const productosConDescuento = await Promise.all(
      productos.map(async (p) => {
        const stock = p.inventario?.cantidad ?? 0
        const descuento = await aplicarDescuento(p.id_producto, p.precio, stock)
        return { ...p, descuento }
      })
    )
   res.json(productosConDescuento)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener catálogo" });
  }
};

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
              where: { estado_producto: "activo" },
              take: 4,
              orderBy: { ultima_modificacion_stock: "desc" },
            },
          },
        },
      },
    });
    res.json(emprendedoras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tiendas" });
  }
};

export const eliminarItem = async (req, res) => {
  try {
    const id = Number(req.params.id)

    // Soft delete — cambia estado en vez de borrar
    await prisma.producto.update({
      where: { id_producto: id },
      data: { estado_producto: "inactivo", visible: false }
    })

    res.json({ message: "Producto eliminado correctamente" })
  } catch (error) {
    console.error("ERROR ELIMINANDO:", error)
    res.status(500).json({ error: error.message })
  }
}