
import prisma from "../conexion.js";

export const registrarAuditoria = async ({
  db = prisma,
  usuarioId,
  registroId,
  tabla,
  accion,
  detalles,
}) => {
  if (!usuarioId || !registroId || !tabla || !accion) {
    throw new Error("Faltan datos obligatorios para registrar la auditoría");
  }

  return await db.auditoria.create({
    data: {
      id_usuario_accion: Number(usuarioId),
      id_registro: Number(registroId),
      tabla_afectada: tabla,
      accion,
      fecha: new Date(),
      detalles: detalles || null,
    },
  });
};
