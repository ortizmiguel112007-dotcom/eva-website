import prisma from "../conexion.js";
import { aplicarDescuento } from './reglasdescuento.controller.js'

// Obtener o crear carrito del usuario
const getOCrearCarrito = async (id_usuario) => {
  let carrito = await prisma.carrito.findUnique({
    where: { id_usuario },
    include: {
      items: {
        include: {
          producto: {
            include: {
              inventario: true,
              seccion: {
                include: {
                  emprendedora: {
                    include: { usuario: { select: { nombre: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!carrito) {
    carrito = await prisma.carrito.create({
      data: { id_usuario },
      include: {
        items: {
          include: {
            producto: {
              include: {
                inventario: true,
                seccion: {
                  include: {
                    emprendedora: {
                      include: { usuario: { select: { nombre: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  return carrito;
};

// GET /api/carrito — obtener carrito del usuario
export const getCarrito = async (req, res) => {
  try {
    const carrito = await getOCrearCarrito(req.user.id)

    // Aplicar descuentos a cada item
    const itemsConDescuento = await Promise.all(
      carrito.items.map(async (item) => {
        try {
          const stock = item.producto?.inventario?.cantidad ?? 0
          const descuento = await aplicarDescuento(
            item.id_producto,
            item.producto?.precio,
            stock
          )
          return {
            ...item,
            producto: { ...item.producto, descuento }
          }
        } catch {
          return item
        }
      })
    )

    res.json({ ...carrito, items: itemsConDescuento })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error al obtener el carrito" })
  }
};
// POST /api/carrito/items — agregar producto al carrito
export const agregarItem = async (req, res) => {
  try {
    const { id_producto, cantidad = 1 } = req.body;

    if (!id_producto)
      return res.status(400).json({ error: "id_producto es requerido" });
    if (cantidad < 1)
      return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });

    // verificar que el producto existe y tiene stock
    const producto = await prisma.producto.findUnique({
      where: { id_producto: Number(id_producto) },
      include: { inventario: true },
    });

    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });

    const stock = producto.inventario?.cantidad ?? 0;
    if (stock === 0) return res.status(400).json({ error: "Producto agotado" });

    const carrito = await getOCrearCarrito(req.user.id);

    const itemExistente = await prisma.carritoItem.findFirst({
      where: {
        id_carrito: carrito.id_carrito,
        id_producto: Number(id_producto),
      },
    });

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + Number(cantidad);
      if (nuevaCantidad > stock) {
        return res
          .status(400)
          .json({ error: `Solo hay ${stock} unidades disponibles` });
      }
      const item = await prisma.carritoItem.update({
        where: { id_item: itemExistente.id_item },
        data: { cantidad: nuevaCantidad },
        include: { producto: { include: { inventario: true } } },
      });
      return res.json({ message: "Cantidad actualizada", item });
    }

    if (cantidad > stock) {
      return res
        .status(400)
        .json({ error: `Solo hay ${stock} unidades disponibles` });
    }

    const item = await prisma.carritoItem.create({
      data: {
        id_carrito: carrito.id_carrito,
        id_producto: Number(id_producto),
        cantidad: Number(cantidad),
      },
      include: { producto: { include: { inventario: true } } },
    });

    // actualizar fecha del carrito
    await prisma.carrito.update({
      where: { id_carrito: carrito.id_carrito },
      data: { fecha_act: new Date() },
    });

    res.status(201).json({ message: "Producto agregado al carrito", item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
};

// PUT /api/carrito/items/:id — actualizar cantidad
export const actualizarItem = async (req, res) => {
  try {
    const id_item = Number(req.params.id);
    const { cantidad } = req.body;

    if (cantidad < 1) {
      // si cantidad es 0 o menos, eliminar
      await prisma.carritoItem.delete({ where: { id_item } });
      return res.json({ message: "Producto eliminado del carrito" });
    }

    const item = await prisma.carritoItem.findUnique({
      where: { id_item },
      include: { producto: { include: { inventario: true } } },
    });

    if (!item) return res.status(404).json({ error: "Item no encontrado" });

    const stock = item.producto.inventario?.cantidad ?? 0;
    if (cantidad > stock) {
      return res
        .status(400)
        .json({ error: `Solo hay ${stock} unidades disponibles` });
    }

    const actualizado = await prisma.carritoItem.update({
      where: { id_item },
      data: { cantidad: Number(cantidad) },
      include: { producto: { include: { inventario: true } } },
    });

    res.json({ message: "Cantidad actualizada", item: actualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar item" });
  }
};

// DELETE /api/carrito/items/:id — eliminar item
export const eliminarItem = async (req, res) => {
  try {
    const id_item = Number(req.params.id);
    await prisma.carritoItem.delete({ where: { id_item } });
    res.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar item" });
  }
};

// DELETE /api/carrito — vaciar carrito
export const vaciarCarrito = async (req, res) => {
  try {
    const carrito = await prisma.carrito.findUnique({
      where: { id_usuario: req.user.id },
    });
    if (!carrito) return res.json({ message: "Carrito ya está vacío" });

    await prisma.carritoItem.deleteMany({
      where: { id_carrito: carrito.id_carrito },
    });

    res.json({ message: "Carrito vaciado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al vaciar el carrito" });
  }
};