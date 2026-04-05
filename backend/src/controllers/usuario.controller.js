import { enviarCorreo } from "../services/email.service.js";
import prisma from "../conexion.js";
import jwt from "jsonwebtoken";
import { enviarSolicitudAdmin } from '../services/notificacion.service.js'

const emailRegex = /^[^\s@]+@(gmail\.com|sena\.edu)$/;

const ValidarEmail = async (email) => {
  const existeUsuario = await prisma.user.findUnique({ where: { email } });
  if (existeUsuario) return { status: 409, message: "El email ya está registrado" };
  if (!email.includes("@")) return { status: 400, message: "Email inválido no contiene @" };
  if (!emailRegex.test(email)) return { status: 400, message: "Email inválido. Solo se permiten correos de gmail.com o sena.edu" };
  return null;
};

const ValidarPassword = (password) => {
  if (password.length < 8) return { status: 400, message: "La contraseña debe tener al menos 8 caracteres" };
  return null;
};

// ── Helper: normalizar rol para el token ──────────────────
// En la BD el admin tiene rol "administrador"
// En el token/frontend usamos "admin" para consistencia
const normalizarRol = (rol) => {
  if (rol === "administrador") return "admin"
  return rol
}

export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await prisma.user.findUnique({ where: { email } });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    if (usuario.password !== password) return res.status(401).json({ error: "Contraseña incorrecta" });
    if (!usuario.verificado) return res.status(403).json({ error: "Usuario no verificado. Vuelva a intentar registarte" });
    if (!usuario.activo && usuario.rol !== "emprendedora") return res.status(403).json({ error: "Tu cuenta está desactivada" });

    // Rol real según estado activo
    const rolReal = usuario.activo ? usuario.rol : "usuario"

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: normalizarRol(rolReal), // ← "administrador" → "admin", resto igual
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const response = { token };
    if (!usuario.activo && usuario.rol === "emprendedora") {
      response.pendiente = true;
      response.mensaje = "Tu solicitud está pendiente de aprobación. Puedes navegar como cliente mientras tanto.";
    }

    return res.json(response);
  } catch (error) {
    console.log("Error al iniciar sesión:", error.message);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

export const CreaterDate = async (req, res) => {
  const { nombre, email, telefono, password, rol } = req.body;
  const foto_documento = req.file ? req.file.path : null;

  if (rol === "emprendedora" && !foto_documento) {
    return res.status(400).json({ error: "Las emprendedoras deben subir foto de su documento" });
  }

  if (rol === 'emprendedora') {
    await enviarSolicitudAdmin(nombre, email).catch(err => console.log('Error al notificar admin:', err))
  }

  try {
    const ErrorEmail = await ValidarEmail(email);
    if (ErrorEmail) return res.status(ErrorEmail.status).json({ error: ErrorEmail.message });

    const ErrorPassword = ValidarPassword(password);
    if (ErrorPassword) return res.status(ErrorPassword.status).json({ error: ErrorPassword.message });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificacionPendiente.upsert({
      where: { email },
      update: { nombre, telefono, password, codigo, expiracion, rol: rol || "usuario", foto_documento },
      create: { nombre, email, telefono, password, codigo, expiracion, rol: rol || "usuario", foto_documento },
    });

    await enviarCorreo(email, codigo).catch(err => console.log("Error al enviar correo:", err));

    return res.json({ message: "Usuario creado con éxito, por favor revisa tu correo para verificar tu cuenta." });
  } catch (error) {
    console.log("ERROR COMPLETO:", error);
    return res.status(500).json({ error: "Error al crear el usuario" });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nombre: true, email: true, telefono: true, rol: true },
    });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, telefono, password } = req.body;

    if (password) {
      const errorPassword = ValidarPassword(password);
      if (errorPassword) return res.status(errorPassword.status).json({ error: errorPassword.message });
    }

    const data = {};
    if (nombre)   data.nombre   = nombre;
    if (telefono) data.telefono = telefono;
    if (password) data.password = password;

    const actualizado = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, nombre: true, email: true, telefono: true, rol: true },
    });

    res.json({ message: "Perfil actualizado correctamente", usuario: actualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};
