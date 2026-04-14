import prisma from "../conexion.js";
import { enviarAprobacion } from "../services/notificacion.service.js";
import { crearNotificacion } from "./notificacion.controller.js";
import jwt from "jsonwebtoken";

// Normalizar rol para el token (mismo helper que en usuario.controller)
const normalizarRol = (rol) => (rol === "administrador" ? "admin" : rol);

// GET /admin/usuarios - Todos excepto administradores
export const GetUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      where: { rol: { notIn: ["administrador", "admin"] } },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        verificado: true,
        activo: true,
        emprendedora: { select: { id_emprendedora: true } },
        foto_documento: true,
      },
      orderBy: { id: "asc" },
    });
    return res.json(usuarios);
  } catch (error) {
    console.log("Error al obtener usuarios:", error);
    return res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

// POST /admin/usuarios - Crear usuario directo
export const CreateUsuarioAdmin = async (req, res) => {
  const { nombre, email, telefono, password } = req.body;

  if (!nombre || !email || !password)
    return res
      .status(400)
      .json({ error: "Nombre, email y contraseña son obligatorios" });

  try {
    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe)
      return res.status(409).json({ error: "El email ya está registrado" });

    const usuario = await prisma.user.create({
      data: {
        nombre,
        email,
        telefono: telefono || "",
        password,
        verificado: true,
        activo: true,
      },
    });

    return res.status(201).json({
      message: "Usuario creado correctamente",
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });
  } catch (error) {
    console.log("Error al crear usuario:", error);
    return res.status(500).json({ error: "Error al crear el usuario" });
  }
};

// PUT /admin/usuarios/:id - Actualizar datos
export const UpdateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, password } = req.body;

  try {
    const existe = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existe)
      return res.status(404).json({ error: "Usuario no encontrado" });

    if (email && email !== existe.email) {
      const emailEnUso = await prisma.user.findUnique({ where: { email } });
      if (emailEnUso)
        return res
          .status(409)
          .json({ error: "El email ya está en uso por otro usuario" });
    }

    const data = {};
    if (nombre) data.nombre = nombre;
    if (email) data.email = email;
    if (telefono !== undefined) data.telefono = telefono || "";
    if (password) data.password = password;

    const actualizado = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        verificado: true,
        activo: true,
      },
    });

    return res.json({
      message: "Usuario actualizado correctamente",
      usuario: actualizado,
    });
  } catch (error) {
    console.log("Error al actualizar usuario:", error);
    return res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

// PATCH /admin/usuarios/:id/estado - Toggle activo
export const ToggleEstadoUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const nuevoEstado = !usuario.activo;

    const actualizado = await prisma.user.update({
      where: { id: Number(id) },
      data: { activo: nuevoEstado },
      select: { id: true, nombre: true, activo: true },
    });

    await prisma.auditoria.create({
      data: {
        id_usuario_accion: req.user.id,
        id_registro: Number(id),
        tabla_afectada: "usuario",
        accion: nuevoEstado ? "ACTIVAR" : "DESACTIVAR",
        fecha: new Date(),
        detalles: `Cuenta ${nuevoEstado ? "activada" : "desactivada"}: ${actualizado.nombre}`,
      },
    });

    return res.json({
      message: `Usuario ${nuevoEstado ? "habilitado" : "inhabilitado"} correctamente`,
      usuario: actualizado,
    });
  } catch (error) {
    console.log("Error al cambiar estado:", error);
    return res
      .status(500)
      .json({ error: "Error al cambiar el estado del usuario" });
  }
};

// PUT /admin/usuarios/:id/aprobar — aprobar emprendedora
export const aprobarEmprendedora = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuario = await prisma.user.findUnique({
      where: { id },
      include: { emprendedora: true },
    });

    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    if (usuario.emprendedora) {
      await prisma.user.update({ where: { id }, data: { activo: true } });
      await enviarAprobacion(usuario.email, usuario.nombre).catch((err) =>
        console.log("Error correo:", err),
      );
      await crearNotificacion(
        id,
        "solicitud",
        "Solicitud aprobada",
        "Tu solicitud de emprendedora fue aprobada. ¡Bienvenida a EVA!",
        "/dashboard",
      );
      return res.json({ message: "Emprendedora activada correctamente" });
    }

    await prisma.$transaction(async (tx) => {
      const emprendedora = await tx.emprendedora.create({
        data: { id_usuario: id, estado: true },
      });
      await tx.seccion.create({
        data: {
          id_emprendedora: emprendedora.id_emprendedora,
          nombre_seccion: "Mi tienda",
        },
      });
      await tx.user.update({ where: { id }, data: { activo: true } });
      await tx.auditoria.create({
        data: {
          id_usuario_accion: req.user.id,
          id_registro: id,
          tabla_afectada: "emprendedoras",
          accion: "APROBAR",
          fecha: new Date(),
          detalles: `Emprendedora aprobada: ${usuario.nombre}`,
        },
      });
    });
    await crearNotificacion(
      id,
      "solicitud",
      "¡Solicitud aprobada!",
      "Tu solicitud de emprendedora fue aprobada. ¡Ya puedes ingresar como emprendedora!",
      "/dashboard",
    );

    await enviarAprobacion(usuario.email, usuario.nombre).catch((err) =>
      console.log("Error correo:", err),
    );
    res.json({ message: "Emprendedora aprobada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al aprobar emprendedora" });
  }
};

// PUT /admin/usuarios/:id/rol — cambiar rol + nuevo token normalizado
export const cambiarRol = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rol } = req.body;

    const rolesValidos = ["usuario", "emprendedora", "administrador"];
    if (!rolesValidos.includes(rol))
      return res.status(400).json({ error: "Rol inválido" });

    const usuario = await prisma.user.findUnique({ where: { id } });
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const actualizado = await prisma.user.update({
      where: { id },
      data: { rol },
    });

    await prisma.auditoria.create({
      data: {
        id_usuario_accion: req.user.id,
        id_registro: id,
        tabla_afectada: "usuario",
        accion: "CAMBIO_ROL",
        fecha: new Date(),
        detalles: `Rol cambiado de ${usuario.rol} a ${rol}: ${usuario.nombre}`,
      },
    });

    // Crear emprendedora y sección si el nuevo rol es emprendedora
    if (rol === "emprendedora") {
      const yaExiste = await prisma.emprendedora.findUnique({
        where: { id_usuario: id },
      });
      if (!yaExiste) {
        const emprendedora = await prisma.emprendedora.create({
          data: { id_usuario: id, estado: true },
        });
        await prisma.seccion.create({
          data: {
            id_emprendedora: emprendedora.id_emprendedora,
            nombre_seccion: "Mi tienda",
          },
        });
        await prisma.user.update({
          where: { id },
          data: { activo: true },
        });
      }
    }

    const nuevoToken = jwt.sign(
      {
        id: actualizado.id,
        email: actualizado.email,
        rol: normalizarRol(actualizado.rol),
        nombre: actualizado.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Rol actualizado correctamente",
      usuario: actualizado,
      nuevoToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar rol" });
  }
};

// GET /admin/auditoria
export const listarAuditoria = async (req, res) => {
  try {
    const registros = await prisma.auditoria.findMany({
      orderBy: { fecha: "desc" },
      include: { usuario: { select: { nombre: true, email: true } } },
    });
    res.json(registros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener auditoría" });
  }
};

export const rechazarEmprendedora = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuario = await prisma.user.findUnique({ where: { id } });
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    await prisma.user.update({
      where: { id },
      data: { rol: "usuario", activo: false },
    });

    await prisma.auditoria.create({
      data: {
        id_usuario_accion: req.user.id,
        id_registro: id,
        tabla_afectada: "usuario",
        accion: "RECHAZAR",
        fecha: new Date(),
        detalles: `Solicitud rechazada: ${usuario.nombre}`,
      },
    });
    await crearNotificacion(
      id,
      "solicitud",
      "Solicitud rechazada",
      "Tu solicitud de emprendedora fue rechazada por el administrador.",
      "/perfil",
    );

    res.json({ message: "Solicitud rechazada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al rechazar solicitud" });
  }
};
