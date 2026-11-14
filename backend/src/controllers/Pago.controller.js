
import prisma from "../conexion.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { crearNotificacion } from "./notificacion.controller.js";
import { enviarConfirmacionPedido } from "../services/notificacion.service.js";
import { crearFactura } from "./factura.controller.js";
import { registrarAuditoria } from "../services/auditoria.service.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Registra cualquier evento del historial de un pago (éxito o error)
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

    if (!Array.isArray(id_pedidos) || !id_pedidos.length) {
      return res.status(400).json({ error: "Debes indicar los pedidos" });
    }

    if (!metodo) {
      return res.status(400).json({
        error: "Debes indicar el método de pago",
      });
    }

    // Verificar que los pedidos pertenecen al cliente
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_pedido: { in: id_pedidos.map(Number) },
        id_cliente,
      },
    });

    if (pedidos.length !== id_pedidos.length) {
      return res.status(403).json({ error: "Pedidos inválidos" });
    }

    // Calcular el monto real utilizando los pedidos de la base de datos
    const monto_total = pedidos.reduce(
      (acc, pedido) => acc + Number(pedido.total),
      0
    );

    // Validar el monto calculado
    if (!Number.isFinite(monto_total) || monto_total <= 0) {
      await registrarLog(
        null,
        "error_monto_invalido",
        `Intento de pago rechazado. Monto calculado inválido: ${monto_total}`,
        id_cliente
      );

      return res.status(400).json({
        error: "El monto del pago es inválido",
      });
    }

    // Comprobar el monto enviado por el cliente
    if (req.body.monto_total !== undefined) {
      const montoEnviado = Number(req.body.monto_total);

      if (
        !Number.isFinite(montoEnviado) ||
        montoEnviado <= 0 ||
        Math.abs(montoEnviado - monto_total) > 0.001
      ) {
        await registrarLog(
          null,
          "error_monto_invalido",
          `Intento de pago rechazado. Monto enviado: ${req.body.monto_total}. Monto real: ${monto_total}`,
          id_cliente
        );

        return res.status(400).json({
          error: "El monto enviado no es válido o no coincide con el total de los pedidos",
        });
      }
    }

    // Subir comprobante si existe
    let urlComprobante = null;

    if (req.file) {
      urlComprobante = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "eva-comprobantes",
            resource_type: "image",
          },
          (error, result) =>
            error ? reject(error) : resolve(result.secure_url),
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    // Crear pago, vincular pedidos y registrar auditoría
    const resultado = await prisma.$transaction(async (tx) => {
      const pago = await tx.pago.create({
        data: {
          id_cliente,
          monto_total,
          metodo,
          estado: metodo === "contraentrega" ? "aprobado" : "pendiente",
          comprobante: urlComprobante,
        },
      });

      await tx.pedido.updateMany({
        where: {
          id_pedido: { in: id_pedidos.map(Number) },
        },
        data: {
          id_pago: pago.id_pago,
          estado:
            metodo === "contraentrega"
              ? "en_proceso"
              : "pago_enviado",
          metodo_pago: metodo,
        },
      });

      await registrarAuditoria({
        db: tx,
        usuarioId: id_cliente,
        registroId: pago.id_pago,
        tabla: "pagos",
        accion: "CREAR",
        detalles: `Pago #${pago.id_pago} creado. Monto: $${Number(
          monto_total
        ).toLocaleString("es-CO")}. Método: ${metodo}`,
      });

      return pago;
    });

    const pago = resultado;

    await registrarLog(
      pago.id_pago,
      "creado",
      `Monto: ${pago.monto_total}, método: ${pago.metodo}`,
      id_cliente,
    );

    // Registrar la confirmación inmediata de contraentrega
    if (metodo === "contraentrega") {
      await registrarAuditoria({
        usuarioId: id_cliente,
        registroId: pago.id_pago,
        tabla: "pagos",
        accion: "APROBAR",
        detalles: `Pago #${pago.id_pago} confirmado mediante contraentrega`,
      });
    }

    // Notificar emprendedoras
    const pedidosConSeccion = await prisma.pedido.findMany({
      where: {
        id_pedido: { in: id_pedidos.map(Number) },
      },
      include: {
        seccion: {
          include: {
            emprendedora: {
              include: { usuario: true },
            },
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

    res.status(201).json({
      message: "Pago registrado correctamente",
      pago,
    });
  } catch (error) {
    console.error(error);

    await registrarLog(
      null,
      "error_creacion",
      error.message,
      req.user?.id
    );

    res.status(500).json({
      error: "Error al registrar pago",
    });
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
                producto: {
                  select: {
                    nombre_producto: true,
                    imagen: true,
                  },
                },
              },
            },
            seccion: {
              include: {
                emprendedora: {
                  include: {
                    usuario: {
                      select: { nombre: true },
                    },
                  },
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

    if (!emprendedora) {
      return res.status(404).json({
        error: "Emprendedora no encontrada",
      });
    }

    const idSecciones = emprendedora.secciones.map(
      (s) => s.id_seccion
    );

    const pedidos = await prisma.pedido.findMany({
      where: {
        id_seccion: { in: idSecciones },
        id_pago: { not: null },
      },
      include: {
        pago: true,
        cliente: {
          select: {
            nombre: true,
            email: true,
          },
        },
        detalles: {
          include: {
            producto: {
              select: {
                nombre_producto: true,
                imagen: true,
              },
            },
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

    if (!["aprobado", "rechazado"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const pago = await prisma.pago.findUnique({
      where: { id_pago },
      include: {
        pedidos: {
          include: { cliente: true },
        },
      },
    });

    if (!pago) {
      return res.status(404).json({
        error: "Pago no encontrado",
      });
    }

    // Evitar procesar nuevamente un pago aprobado
    if (pago.estado === "aprobado") {
      return res.status(400).json({
        error: "Este pago ya fue aprobado anteriormente",
      });
    }

    // Actualizar pago, pedidos y auditoría
    const pagoActualizado = await prisma.$transaction(async (tx) => {
      const actualizado = await tx.pago.update({
        where: { id_pago },
        data: {
          estado,
          fecha_verif: new Date(),
          nota_rechazo:
            estado === "rechazado"
              ? nota_rechazo || null
              : null,
        },
      });

      await tx.pedido.updateMany({
        where: { id_pago },
        data: {
          estado:
            estado === "aprobado"
              ? "en_proceso"
              : "pago_rechazado",
        },
      });

      await registrarAuditoria({
        db: tx,
        usuarioId: req.user.id,
        registroId: id_pago,
        tabla: "pagos",
        accion: estado === "aprobado" ? "APROBAR" : "RECHAZAR",
        detalles:
          estado === "aprobado"
            ? `Pago #${id_pago} aprobado por la emprendedora`
            : `Pago #${id_pago} rechazado. Motivo: ${nota_rechazo || "No especificado"}`,
      });

      return actualizado;
    });

    await registrarLog(
      id_pago,
      estado,
      nota_rechazo || null,
      req.user?.id
    );

    // Notificar al cliente
    if (pago.pedidos[0]?.id_cliente) {
      await crearNotificacion(
        pago.pedidos[0].id_cliente,
        "pago",
        estado === "aprobado"
          ? "Pago aprobado"
          : "Pago rechazado",
        estado === "aprobado"
          ? "Tu comprobante fue verificado. Tu pedido está en proceso."
          : `Tu comprobante fue rechazado. ${nota_rechazo || ""}`,
        "/mis-pedidos",
      );
    }

    // Enviar correo cuando Nequi o Bancolombia sean aprobados
    if (estado === "aprobado") {
      try {
        const pedidos = await prisma.pedido.findMany({
          where: { id_pago },
          include: {
            cliente: {
              select: {
                nombre: true,
                email: true,
              },
            },
            detalles: {
              include: {
                producto: {
                  select: {
                    nombre_producto: true,
                    imagen: true,
                    precio: true,
                  },
                },
              },
            },
            seccion: {
              include: {
                emprendedora: {
                  include: {
                    usuario: {
                      select: { nombre: true },
                    },
                  },
                },
              },
            },
          },
        });

        for (const pedido of pedidos) {
          try {
            const clienteData = pedido.cliente;

            if (!clienteData?.email) {
              console.error(
                `El pedido #${pedido.id_pedido} no tiene correo de cliente`
              );
              continue;
            }

            const resultado = await crearFactura({
              ...pedido,
              cliente: clienteData,
            });

            const adjunto = resultado
              ? {
                  filename: `${resultado.numero}.pdf`,
                  buffer: resultado.bufferPDF,
                }
              : null;

            await enviarConfirmacionPedido(
              clienteData.email,
              clienteData.nombre?.trim(),
              {
                ...pedido,
                metodo_pago: pago.metodo,
              },
              "pago",
              adjunto
            );
          } catch (errorCorreo) {
            console.error(
              `Error enviando correo del pedido #${pedido.id_pedido}:`,
              errorCorreo
            );
          }
        }
      } catch (errorCorreo) {
        console.error(
          "Error preparando correos de confirmación:",
          errorCorreo
        );
      }
    }

    return res.json({
      message: `Pago ${estado}`,
      pago: pagoActualizado,
    });
  } catch (error) {
    console.error(error);

    await registrarLog(
      Number(req.params.id_pago),
      "error_verificacion",
      error.message,
      req.user?.id
    );

    return res.status(500).json({
      error: "Error al verificar pago",
    });
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

    if (!pago) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    if (pago.id_cliente !== req.user.id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    if (pago.estado !== "rechazado") {
      return res.status(400).json({
        error: "El pago no está rechazado",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Debes subir un comprobante",
      });
    }

    const urlComprobante = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "eva-comprobantes",
          resource_type: "image",
        },
        (error, result) =>
          error ? reject(error) : resolve(result.secure_url),
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    // Actualizar pago, pedidos y auditoría
    const pagoActualizado = await prisma.$transaction(async (tx) => {
      const actualizado = await tx.pago.update({
        where: { id_pago },
        data: {
          comprobante: urlComprobante,
          estado: "pendiente",
          nota_rechazo: null,
          fecha_verif: null,
        },
      });

      await tx.pedido.updateMany({
        where: { id_pago },
        data: { estado: "pago_enviado" },
      });

      await registrarAuditoria({
        db: tx,
        usuarioId: req.user.id,
        registroId: id_pago,
        tabla: "pagos",
        accion: "REENVIAR_COMPROBANTE",
        detalles: `El cliente reenvió el comprobante del pago #${id_pago}`,
      });

      return actualizado;
    });

    await registrarLog(
      id_pago,
      "comprobante_subido",
      null,
      req.user.id
    );

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
      req.user?.id
    );

    res.status(500).json({
      error: "Error al reenviar comprobante",
    });
  }
};

// PUT /api/pagos/:id_pago/comprobante — cliente sube comprobante por primera vez
export const subirComprobante = async (req, res) => {
  try {
    const id_pago = Number(req.params.id_pago);

    if (!Number.isInteger(id_pago) || id_pago <= 0) {
      return res.status(400).json({
        error: "ID de pago inválido",
      });
    }

    const pago = await prisma.pago.findUnique({
      where: { id_pago },
      include: { pedidos: true },
    });

    if (!pago) {
      return res.status(404).json({
        error: "Pago no encontrado",
      });
    }

    if (pago.id_cliente !== req.user.id) {
      return res.status(403).json({
        error: "No autorizado",
      });
    }

    if (pago.estado !== "pendiente") {
      return res.status(400).json({
        error: "Este pago no está pendiente de comprobante",
      });
    }

    if (pago.comprobante) {
      return res.status(400).json({
        error: "Este pago ya tiene un comprobante. Si fue rechazado, utiliza la opción de reenviar.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Debes subir un comprobante",
      });
    }

    if (!["nequi", "bancolombia"].includes(pago.metodo)) {
      return res.status(400).json({
        error: "Este método de pago no requiere comprobante",
      });
    }

    const urlComprobante = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "eva-comprobantes",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    // Actualizar pago, pedidos y auditoría
    const pagoActualizado = await prisma.$transaction(async (tx) => {
      const actualizado = await tx.pago.update({
        where: { id_pago },
        data: {
          comprobante: urlComprobante,
        },
      });

      await tx.pedido.updateMany({
        where: { id_pago },
        data: { estado: "pago_enviado" },
      });

      await registrarAuditoria({
        db: tx,
        usuarioId: req.user.id,
        registroId: id_pago,
        tabla: "pagos",
        accion: "COMPROBANTE_SUBIDO",
        detalles: `El cliente subió el comprobante del pago #${id_pago}`,
      });

      return actualizado;
    });

    await registrarLog(
      id_pago,
      "comprobante_subido",
      null,
      req.user.id
    );

    return res.json({
      message: "Comprobante enviado correctamente",
      pago: pagoActualizado,
    });
  } catch (error) {
    console.error("Error al subir comprobante:", error);

    await registrarLog(
      Number(req.params.id_pago),
      "error_subida",
      error.message,
      req.user?.id
    );

    return res.status(500).json({
      error: "Error al subir comprobante",
    });
  }
};

// GET /api/admin/pagos — admin ve todos los pagos
export const listarPagosAdmin = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      include: {
        cliente: {
          select: {
            nombre: true,
            email: true,
          },
        },
        pedidos: {
          include: {
            detalles: {
              include: {
                producto: {
                  select: { nombre_producto: true },
                },
              },
            },
            seccion: {
              include: {
                emprendedora: {
                  include: {
                    usuario: {
                      select: { nombre: true },
                    },
                  },
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
    res.status(500).json({
      error: "Error al obtener pagos",
    });
  }
};

// GET /api/admin/pagos/:id_pago/historial
// Consultar los eventos del historial de un pago
export const listarHistorialPago = async (req, res) => {
  try {
    const id_pago = Number(req.params.id_pago);

    if (!Number.isInteger(id_pago) || id_pago <= 0) {
      return res.status(400).json({
        error: "Identificador de pago inválido",
      });
    }

    const pago = await prisma.pago.findUnique({
      where: { id_pago },
      select: { id_pago: true },
    });

    if (!pago) {
      return res.status(404).json({
        error: "Pago no encontrado",
      });
    }

    const logs = await prisma.pagoLog.findMany({
      where: { id_pago },
      include: {
        usuario: {
          select: {
            nombre: true,
            rol: true,
          },
        },
      },
      orderBy: { fecha: "asc" },
    });

    return res.json(logs);
  } catch (error) {
    console.error(
      "Error al consultar historial del pago:",
      error
    );

    return res.status(500).json({
      error: "Error al obtener el historial del pago",
    });
  }
};

// GET /api/admin/pagos/errores
// Consultar errores e intentos de pago fallidos
export const listarErroresPagosAdmin = async (req, res) => {
  try {
    const errores = await prisma.pagoLog.findMany({
      where: {
        OR: [
          {
            evento: {
              startsWith: "error_",
            },
          },
          {
            evento: "rechazado",
          },
        ],
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        pago: {
          select: {
            id_pago: true,
            monto_total: true,
            metodo: true,
            estado: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    return res.json(errores);
  } catch (error) {
    console.error(
      "Error al consultar errores de pagos:",
      error
    );

    return res.status(500).json({
      error: "Error al obtener los registros de auditoría de pagos",
    });
  }
};
