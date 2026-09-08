import prisma from "../conexion.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { crearNotificacion } from "./notificacion.controller.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Registra cualquier evento del ciclo de vida de un pago (éxito o error)
export const registrarLog = async (
  id_pago,
  evento,
  detalle = null,
  id_usuario = null,
) => {
  try {
    await prisma.pagoLog.create({
      data: { id_pago, evento, detalle, id_usuario },
    });
  } catch (err) {
    console.error("Error registrando PagoLog:", err);
  }
};

// POST /api/pagos — cliente crea un pago y vincula sus pedidos
export const crearPago = async (req, res) => {
  try {
    const id_cliente = req.user.id;
    const { metodo } = req.body;

    let id_pedidos;
    try {
      id_pedidos = JSON.parse(req.body.id_pedidos);
    } catch {
      return res.status(400).json({ error: "id_pedidos inválido" });
    }

    if (!Array.isArray(id_pedidos) || !id_pedidos.length)
      return res.status(400).json({ error: "Debes indicar los pedidos" });
    if (!metodo)
      return res.status(400).json({ error: "Debes indicar el método de pago" });

    // Verificar que los pedidos pertenecen al cliente
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_pedido: { in: id_pedidos.map(Number) },
        id_cliente,
      },
    });

    if (pedidos.length !== id_pedidos.length)
      return res.status(403).json({ error: "Pedidos inválidos" });

    const monto_total = pedidos.reduce((acc, p) => acc + Number(p.total), 0);

    // Subir comprobante si existe
    let urlComprobante = null;
    if (req.file) {
      urlComprobante = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "eva-comprobantes", resource_type: "image" },
          (error, result) =>
            error ? reject(error) : resolve(result.secure_url),
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    // Crear el pago
    const pago = await prisma.pago.create({
      data: {
        id_cliente,
        monto_total,
        metodo,
        estado: metodo === "contraentrega" ? "aprobado" : "pendiente",
        comprobante: urlComprobante,
      },
    });

    await registrarLog(
      pago.id_pago,
      "creado",
      `Monto: ${pago.monto_total}, método: ${pago.metodo}`,
      id_cliente,
    );

    // Vincular pedidos al pago y actualizar estado
    await prisma.pedido.updateMany({
      where: { id_pedido: { in: id_pedidos.map(Number) } },
      data: {
        id_pago: pago.id_pago,
        estado: metodo === "contraentrega" ? "en_proceso" : "pago_enviado",
        metodo_pago: metodo,
      },
    });

    // Notificar emprendedoras
    const pedidosConSeccion = await prisma.pedido.findMany({
      where: { id_pedido: { in: id_pedidos.map(Number) } },
      include: {
        seccion: {
          include: {
            emprendedora: { include: { usuario: true } },
          },
        },
      },
    });

    for (const pedido of pedidosConSeccion) {
      const emprendedora = pedido.seccion?.emprendedora?.usuario;
      if (emprendedora) {
        await crearNotificacion(
          emprendedora.id,
          "pago",
          metodo === "contraentrega"
            ? "Pago confirmado — Contra entrega"
            : "Comprobante recibido",
          metodo === "contraentrega"
            ? `El pedido #${pedido.id_pedido} fue confirmado. El cliente pagará al recibir.`
            : `Un cliente subió el comprobante del pedido #${pedido.id_pedido}.`,
          "/pagos",
        );
      }
    }

    res.status(201).json({ message: "Pago registrado correctamente", pago });
  } catch (error) {
    console.error(error);
    await registrarLog(null, "error_creacion", error.message, req.user?.id);
    res.status(500).json({ error: "Error al registrar pago" });
  }
};

// GET /api/pagos/mis-pagos — cliente ve sus pagos
export const listarPagosCliente = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      where: { id_cliente: req.user.id },
      include: {
        pedidos: {
          include: {
            detalles: {
              include: {
                producto: { select: { nombre_producto: true, imagen: true } },
              },
            },
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
      orderBy: { fecha: "desc" },
    });
    res.json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pagos" });
  }
};

// GET /api/pagos/emprendedora — emprendedora ve pagos de sus pedidos
export const listarPagosEmprendedora = async (req, res) => {
  try {
    const emprendedora = await prisma.emprendedora.findUnique({
      where: { id_usuario: req.user.id },
      include: { secciones: true },
    });
    if (!emprendedora)
      return res.status(404).json({ error: "Emprendedora no encontrada" });

    const idSecciones = emprendedora.secciones.map((s) => s.id_seccion);

    // Obtener pedidos de la emprendedora que tengan pago
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_seccion: { in: idSecciones },
        id_pago: { not: null },
      },
      include: {
        pago: true,
        cliente: { select: { nombre: true, email: true } },
        detalles: {
          include: {
            producto: { select: { nombre_producto: true, imagen: true } },
          },
        },
      },
      orderBy: { fecha: "desc" },
    });

    // Agrupar por pago para no mostrar duplicados
    const pagosMap = {};
    for (const pedido of pedidos) {
      const id_pago = pedido.id_pago;
      if (!pagosMap[id_pago]) {
        pagosMap[id_pago] = {
          ...pedido.pago,
          cliente: pedido.cliente,
          pedidos: [],
        };
      }
      pagosMap[id_pago].pedidos.push(pedido);
    }

    res.json(Object.values(pagosMap));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pagos" });
  }
};

// PUT /api/pagos/:id_pago/verificar — emprendedora verifica el pago
export const verificarPago = async (req, res) => {
  try {
    const id_pago = Number(req.params.id_pago);
    const { estado, nota_rechazo } = req.body;

    if (!["aprobado", "rechazado"].includes(estado))
      return res.status(400).json({ error: "Estado inválido" });

    const pago = await prisma.pago.findUnique({
      where: { id_pago },
      include: { pedidos: { include: { cliente: true } } },
    });
    if (!pago) return res.status(404).json({ error: "Pago no encontrado" });

    // Actualizar pago
    const pagoActualizado = await prisma.pago.update({
      where: { id_pago },
      data: {
        estado,
        fecha_verif: new Date(),
        nota_rechazo: estado === "rechazado" ? nota_rechazo || null : null,
      },
    });

    await registrarLog(id_pago, estado, nota_rechazo || null, req.user?.id);

    // Actualizar estado de todos los pedidos vinculados
    await prisma.pedido.updateMany({
      where: { id_pago },
      data: {
        estado: estado === "aprobado" ? "en_proceso" : "pago_rechazado",
      },
    });

    // Notificar al cliente
    if (pago.pedidos[0]?.id_cliente) {
      await crearNotificacion(
        pago.pedidos[0].id_cliente,
        "pago",
        estado === "aprobado" ? "Pago aprobado" : "Pago rechazado",
        estado === "aprobado"
          ? "Tu comprobante fue verificado. Tu pedido está en proceso."
          : `Tu comprobante fue rechazado. ${nota_rechazo || ""}`,
        "/mis-pedidos",
      );
    }

    res.json({ message: `Pago ${estado}`, pago: pagoActualizado });
  } catch (error) {
    console.error(error);
    await registrarLog(
      Number(req.params.id_pago),
      "error_verificacion",
      error.message,
      req.user?.id,
    );
    res.status(500).json({ error: "Error al verificar pago" });
  }
};

// PUT /api/pagos/:id_pago/reenviar — cliente reenvía comprobante rechazado
export const reenviarComprobante = async (req, res) => {
  try {
    const id_pago = Number(req.params.id_pago);

    const pago = await prisma.pago.findUnique({
      where: { id_pago },
      include: { pedidos: true },
    });

    if (!pago) return res.status(404).json({ error: "Pago no encontrado" });
    if (pago.id_cliente !== req.user.id)
      return res.status(403).json({ error: "No autorizado" });
    if (pago.estado !== "rechazado")
      return res.status(400).json({ error: "El pago no está rechazado" });
    if (!req.file)
      return res.status(400).json({ error: "Debes subir un comprobante" });

    const urlComprobante = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "eva-comprobantes", resource_type: "image" },
        (error, result) => (error ? reject(error) : resolve(result.secure_url)),
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const pagoActualizado = await prisma.pago.update({
      where: { id_pago },
      data: {
        comprobante: urlComprobante,
        estado: "pendiente",
        nota_rechazo: null,
        fecha_verif: null,
      },
    });

    await registrarLog(id_pago, "comprobante_subido", null, req.user.id);

    await prisma.pedido.updateMany({
      where: { id_pago },
      data: { estado: "pago_enviado" },
    });

    res.json({
      message: "Comprobante reenviado correctamente",
      pago: pagoActualizado,
    });
  } catch (error) {
    console.error(error);
    await registrarLog(
      Number(req.params.id_pago),
      "error_subida",
      error.message,
      req.user?.id,
    );
    res.status(500).json({ error: "Error al reenviar comprobante" });
  }
};

// GET /api/admin/pagos — admin ve todos los pagos
export const listarPagosAdmin = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      include: {
        cliente: { select: { nombre: true, email: true } },
        pedidos: {
          include: {
            detalles: {
              include: {
                producto: { select: { nombre_producto: true } },
              },
            },
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
      orderBy: { fecha: "desc" },
    });
    res.json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pagos" });
  }
};
