import prisma from "../conexion.js";
import { crearNotificacion } from "./notificacion.controller.js";
import { registrarMovimiento } from "./movimientoInventario.controller.js";
import { enviarConfirmacionPedido } from "../services/notificacion.service.js";
import { aplicarDescuento } from "./reglasdescuento.controller.js";
import { registrarLog } from "./Pago.controller.js"
import { crearFactura } from "./factura.controller.js"
import { soloEmprendedoraActiva } from "../utils/filtroEmprendedoraActiva.js"
// GET /api/pedidos — pedidos de la emprendedora logueada
export const listarPedidos = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: { secciones: true },
    });

    if (!emprendedora)
      return res.status(404).json({ error: "Emprendedora no encontrada" });

    const idSecciones = emprendedora.secciones.map((s) => s.id_seccion);

    const pedidos = await prisma.pedido.findMany({
      where: { id_seccion: { in: idSecciones } },
      include: {
        cliente: { select: { nombre: true, email: true, telefono: true } },
        pago: true,
        detalles: {
          include: {
            producto: {
              select: { nombre_producto: true, imagen: true, precio: true },
            },
          },
        },
      },
      orderBy: { fecha: "desc" },
    });

    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

// PUT /api/pedidos/:id/estado — cambiar estado LOGÍSTICO del pedido
// Ojo: los estados relacionados con pago (pago_enviado, pago_rechazado, en_proceso)
// ahora los maneja pago.controller.js (subirComprobante / verificarPago),
// porque dependen del Pago (que puede cubrir varios pedidos a la vez), no de un pedido aislado.
export const cambiarEstadoPedido = async (req, res) => {
  try {
    const id_pedido = Number(req.params.id);
    const { estado } = req.body;

    const estadosValidos = ["enviado", "entregado", "cancelado"];
    if (!estadosValidos.includes(estado))
      return res.status(400).json({ error: "Estado inválido" });

    // RN-030: solo el admin puede cancelar pedidos
    if (estado === "cancelado" && req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo un administrador puede cancelar pedidos" });
    }

    const pedido = await prisma.pedido.update({
      where: { id_pedido },
      data: { estado },
    });

    // RN-030: dejar registro en auditoría cuando se cancela
    if (estado === "cancelado") {
      await prisma.auditoria.create({
        data: {
          id_usuario_accion: req.user.id,
          id_registro: id_pedido,
          tabla_afectada: "pedidos",
          accion: "cancelado",
          fecha: new Date(),
          detalles: `Pedido #${id_pedido} cancelado por administrador`,
        },
      });
    }

    const mensajes = {
      enviado: {
        titulo: "Pedido enviado",
        mensaje: `Tu pedido #${id_pedido} está en camino.`,
      },
      entregado: {
        titulo: "Pedido entregado",
        mensaje: `Tu pedido #${id_pedido} fue entregado.`,
      },
      cancelado: {
        titulo: "Pedido cancelado",
        mensaje: `Tu pedido #${id_pedido} fue cancelado.`,
      },
    };

    if (mensajes[estado]) {
      await crearNotificacion(
        pedido.id_cliente,
        "pedido",
        mensajes[estado].titulo,
        mensajes[estado].mensaje,
        "/mis-pedidos",
      );
    }

    res.json({ message: "Estado actualizado", pedido });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
};

// GET /api/pedidos/:id — detalle de un pedido
export const obtenerPedido = async (req, res) => {
  
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(req.params.id) },
      include: {
        cliente: { select: { nombre: true, email: true, telefono: true } },
        pago: true,
        detalles: {
          include: {
            producto: {
              select: { nombre_producto: true, imagen: true, precio: true },
            },
          },
        },
      },
    });

    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pedido" });
  }
};

// POST /api/cliente/pedidos — crea UN pago + N pedidos (uno por sección/emprendedora)
export const crearPedido = async (req, res) => {
  try {
    const id_cliente = req.user.id;
    const { items, metodo_pago, nota,id_cupon} = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ error: "El carrito está vacío" });
    if (!metodo_pago)
      return res.status(400).json({ error: "Debes seleccionar un método de pago" });

    const productosIds = items.map((i) => i.id_producto);
    const productos = await prisma.producto.findMany({
      where: { id_producto: { in: productosIds }, ...soloEmprendedoraActiva },
      include: {
        seccion: {
          include: {
            emprendedora: { include: { usuario: { select: { nombre: true } } } },
          },
        },
        inventario: true,
      },
    });

    for (const item of items) {
      const prod = productos.find((p) => p.id_producto === item.id_producto);
      if (!prod)
        return res.status(404).json({ error: `El producto ${item.id_producto} ya no está disponible` });
      const stock = prod.inventario?.cantidad ?? 0;
      if (stock < item.cantidad)
        return res.status(400).json({ error: `Stock insuficiente para "${prod.nombre_producto}"` });
    }

    // RF-097/RN-085: validar el cupón ANTES de la transacción, con reglas de negocio completas
    let cuponValidado = null
    let idsSeccionCupon = []
    if (id_cupon) {
      const cupon = await prisma.cupon.findUnique({ where: { id_cupon: Number(id_cupon) } })
      if (!cupon) return res.status(404).json({ error: "Cupón no encontrado" })
      if (!cupon.activo) return res.status(400).json({ error: "Cupón inactivo" })
      if (cupon.fecha_inicio && new Date() < cupon.fecha_inicio)
        return res.status(400).json({ error: "Este cupón aún no está vigente" })
      if (cupon.fecha_fin && new Date() > cupon.fecha_fin)
        return res.status(400).json({ error: "Cupón expirado" })
      if (cupon.limite_usos && cupon.usos >= cupon.limite_usos)
        return res.status(400).json({ error: "Cupón agotado" })

      const emprendedoraCupon = await prisma.emprendedora.findUnique({
        where: { id_usuario: cupon.id_usuario },
        include: { secciones: { select: { id_seccion: true } } },
      })
      idsSeccionCupon = emprendedoraCupon?.secciones.map((s) => s.id_seccion) || []
      cuponValidado = cupon
    }

    const grupos = {};
    for (const item of items) {
      const prod = productos.find((p) => p.id_producto === item.id_producto);
      const id_seccion = prod.id_seccion;
      if (!grupos[id_seccion]) {
        grupos[id_seccion] = {
          id_seccion,
          emprendedora: prod.seccion.emprendedora?.usuario?.nombre || "EVA",
          items: [],
        };
      }
      grupos[id_seccion].items.push({ ...item, producto: prod });
    }

     // RN-085 (aclaración de scope): si el cliente aplicó un cupón pero ningún
    // producto del carrito pertenece a la tienda que lo emitió, se rechaza —
    // evita que el cliente "aproveche" un cupón que no le corresponde a esa compra.
    if (cuponValidado && !Object.keys(grupos).some((idSeccion) => idsSeccionCupon.includes(Number(idSeccion)))) {
      return res.status(400).json({ error: "Este cupón no aplica a los productos de tu carrito" })
    }

   const resultado = await prisma.$transaction(async (tx) => {
      let montoTotal = 0;
      let descuentoCuponTotal = 0;
      let idPedidoConCupon = null; // se asigna al grupo que recibe el descuento
      const datosGrupos = [];

      for (const grupo of Object.values(grupos)) {
        const itemsConPrecioFinal = await Promise.all(
          grupo.items.map(async (i) => {
            const descuento = await aplicarDescuento(i.id_producto, i.producto.precio, i.producto.inventario?.cantidad ?? 0);
            return { ...i, precioFinal: descuento ? descuento.precio_con_descuento : Number(i.producto.precio) };
          }),
        );
        let total = itemsConPrecioFinal.reduce((acc, i) => acc + i.precioFinal * i.cantidad, 0);

         // Aplica el cupón SOLO al grupo (tienda) que corresponde
        let descuentoCupon = 0
        if (cuponValidado && idsSeccionCupon.includes(grupo.id_seccion)) {
          descuentoCupon = cuponValidado.tipo === "porcentaje"
            ? total * (Number(cuponValidado.valor) / 100)
            : Math.min(Number(cuponValidado.valor), total) // no puede descontar más que el total del grupo
          total = Math.max(0, total - descuentoCupon)
          descuentoCuponTotal += descuentoCupon
        }

        montoTotal += total;
        datosGrupos.push({ ...grupo, itemsConPrecioFinal, total, descuentoCupon });
      }

      // 2. RN-026 / RN-053: un solo Pago para toda la compra.
      // Contraentrega se confirma de inmediato (no requiere comprobante previo).
      const esContraentrega = metodo_pago === "contraentrega";

      const pago = await tx.pago.create({
        data: {
          id_cliente,
          monto_total: montoTotal,
          metodo: metodo_pago,
          estado: esContraentrega ? "aprobado" : "pendiente",
          fecha_verif: esContraentrega ? new Date() : null,
        },
      });

      // 3. Creamos los pedidos (uno por emprendedora), todos vinculados al mismo pago
      const pedidosCreados = [];
      for (const grupo of datosGrupos) {
        const nuevoPedido = await tx.pedido.create({
          data: {
            id_cliente, id_seccion: grupo.id_seccion, id_pago: pago.id_pago,
            nota: nota || null, total: grupo.total,
            estado: esContraentrega ? "en_proceso" : "pendiente_pago",
            id_cupon: grupo.descuentoCupon > 0 ? cuponValidado.id_cupon : null,
            descuento_cupon: grupo.descuentoCupon > 0 ? grupo.descuentoCupon : null,
            detalles: {
              create: grupo.itemsConPrecioFinal.map((i) => ({
                id_producto: i.id_producto, cantidad: i.cantidad, precio_unit: i.precioFinal,
              })),
            },
          },
          include: {
            detalles: { include: { producto: { select: { nombre_producto: true, imagen: true, precio: true } } } },
            seccion: { include: { emprendedora: { include: { usuario: { select: { nombre: true } } } } } },
          },
        });

        if (grupo.descuentoCupon > 0) idPedidoConCupon = nuevoPedido.id_pedido

        for (const item of grupo.items) {
          await tx.inventario.updateMany({
            where: { id_producto: item.id_producto },
            data: { cantidad: { decrement: item.cantidad } },
          });
        }

        pedidosCreados.push(nuevoPedido);
      }
      // RF-097/RN-085: registrar el uso real del cupón, solo si efectivamente se aplicó
      if (cuponValidado && idPedidoConCupon && descuentoCuponTotal > 0) {
        await tx.cupon.update({ where: { id_cupon: cuponValidado.id_cupon }, data: { usos: { increment: 1 } } })
        await tx.cuponUso.create({
          data: {
            id_cupon: cuponValidado.id_cupon, id_cliente,
            id_pedido: idPedidoConCupon, monto_descuento: descuentoCuponTotal,
          },
        })
      }

      return { pago, pedidosCreados };
    });

    const { pago, pedidosCreados } = resultado;
    await registrarLog(pago.id_pago, "creado", `Monto: ${pago.monto_total}, método: ${pago.metodo}`, id_cliente)

    // Notificar a emprendedoras que llegó un pedido nuevo (independiente del estado del pago)
    for (const pedido of pedidosCreados) {
      const emprendedoraDePedido = await prisma.user.findFirst({
        where: { emprendedora: { secciones: { some: { id_seccion: pedido.id_seccion } } } },
        select: { id: true },
      });
      if (emprendedoraDePedido) {
        await crearNotificacion(
          emprendedoraDePedido.id,
          "pedido",
          "Nuevo pedido recibido",
          `Tienes un nuevo pedido por $${Number(pedido.total).toLocaleString("es-CO")}.`,
          "/pedidos",
        );
      }
    }

    // RF-024 / RF-025 / RF-027: registrar la salida en el historial de inventario y
    // alertar a la emprendedora cuando el stock llega al mínimo o se agota
    for (const pedido of pedidosCreados) {
      try {
        const emprendedoraDePedido = await prisma.user.findFirst({
          where: { emprendedora: { secciones: { some: { id_seccion: pedido.id_seccion } } } },
          select: { id: true },
        });

        for (const detalle of pedido.detalles ?? []) {
          const inv = await prisma.inventario.findFirst({
            where: { id_producto: detalle.id_producto },
          });
          if (!inv) continue;

          const cantidadNueva = inv.cantidad;
          const cantidadAntes = cantidadNueva + detalle.cantidad;

          await registrarMovimiento(
            detalle.id_producto,
            "salida",
            cantidadAntes,
            cantidadNueva,
            id_cliente,
            `Venta - pedido #${pedido.id_pedido}`,
          );

          if (!emprendedoraDePedido) continue;

          const prod = await prisma.producto.findUnique({
            where: { id_producto: detalle.id_producto },
            select: { nombre_producto: true },
          });
          const nombre = prod?.nombre_producto ?? "Producto";

          if (cantidadNueva === 0) {
            await crearNotificacion(
              emprendedoraDePedido.id,
              "stock",
              "Producto agotado",
              `"${nombre}" se quedó sin stock.`,
              "/inventario",
            );
          } else if (cantidadNueva <= Number(inv.stock_minimo ?? 0)) {
            await crearNotificacion(
              emprendedoraDePedido.id,
              "stock",
              "Stock bajo",
              `"${nombre}" tiene stock bajo (${cantidadNueva} unidades).`,
              "/inventario",
            );
          }
        }
      } catch (err) {
        console.error("Error registrando movimiento o alerta de stock:", err);
      }
    }

    // Vaciar carrito
    const carrito = await prisma.carrito.findUnique({ where: { id_usuario: id_cliente } });
    if (carrito) {
      await prisma.carritoItem.deleteMany({ where: { id_carrito: carrito.id_carrito } });
    }

   
    // RN-026: correo de confirmación solo si el pago ya nació aprobado (contraentrega)
    // RN-042: la factura también se genera aquí, porque el pago ya está "aprobado" desde su creación
    if (pago.estado === "aprobado") {
      try {
        const clienteData = await prisma.user.findUnique({
          where: { id: id_cliente },
          select: { email: true, nombre: true },
        })
        if (clienteData) {
          for (const pedido of pedidosCreados) {
            const resultado = await crearFactura({ ...pedido, cliente: clienteData })
            const adjunto = resultado
              ? { filename: `${resultado.numero}.pdf`, buffer: resultado.bufferPDF }
              : null

            await enviarConfirmacionPedido(
              clienteData.email,
              clienteData.nombre?.trim(),
              pedido,
              "compra",
              adjunto,
            )
          }
        }
      } catch (err) {
        console.error("Error enviando correo de confirmación:", err)
      }
    }

    res.status(201).json({
      message: `Pago registrado y ${pedidosCreados.length} pedido(s) creado(s) correctamente`,
      pago,
      pedidos: pedidosCreados,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
};

// GET /api/cliente/pedidos — historial de pedidos del cliente
export const listarPedidosCliente = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { id_cliente: req.user.id },
      include: {
        detalles: {
          include: {
            producto: {
              select: { nombre_producto: true, imagen: true, precio: true, id_producto: true },
            },
          },
        },
        seccion: {
          include: { emprendedora: { include: { usuario: { select: { nombre: true } } } } },
        },
        comentarios: { include: { producto: { select: { nombre_producto: true } } } },
        pago: true,
      },
      orderBy: { fecha: "desc" },
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

// GET /api/admin/pedidos — TODOS los pedidos (solo admin)
export const listarTodosPedidosAdmin = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: { select: { nombre: true, email: true } },
        pago: true,
        detalles: {
          include: { producto: { select: { nombre_producto: true, imagen: true, precio: true } } },
        },
      },
      orderBy: { fecha: "desc" },
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};