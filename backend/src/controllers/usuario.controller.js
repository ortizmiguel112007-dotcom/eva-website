import { enviarCorreo } from "../services/email.service.js";
import prisma from '../conexion.js'
import jwt from 'jsonwebtoken'

const emailRegex = /^[^\s@]+@(gmail\.com|sena\.edu)$/;

// Validaciones
const ValidarEmail = async (email) => {
    const existeUsuario = await prisma.user.findUnique({ where: { email } })

    if(existeUsuario) {
      return { status: 409, message: 'El email ya está registrado' }
    }

    if(!email.includes('@')) {
      return { status: 400, message: 'Email inválido no contiene @' }
    }

    if(!emailRegex.test(email)){
      return { status: 400, message: 'Email inválido. Solo se permiten correos de gmail.com o sena.edu' }
    }

    return null
}

const ValidarPassword = (password) => {
  if(password.length < 8) {
    return { status: 400, message: 'La contraseña debe tener al menos 8 caracteres' }
  }

  // if(!/[A-Z]/.test(password)) {
  //   return { status: 400, message: 'La contraseña debe contener al menos una letra mayúscula' }
  // }

  // if(!/[a-z]/.test(password)) {
  //   return { status: 400, message: 'La contraseña debe contener al menos una letra minúscula' }
  // }

  // if(!/[0-9]/.test(password)) {
  //   return { status: 400, message: 'La contraseña debe contener al menos un número' }
  // }

  // if(!/[!@#$%^&*]/.test(password)) {
  //   return { status: 400, message: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*)' }
  // }

  // if(password.includes(' ')) {
  //   return { status: 400, message: 'La contraseña no debe contener espacios' }
  // }

  return null
}

export const Login = async (req, res) => {
  const { email, password } = req.body 

  try{
    const usuario = await prisma.user.findUnique({ where: { email } })

    if(!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    if(usuario.password !== password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }
    if(!usuario.verificado){
      return res.status(403).json({ error: 'Usuario no verificado. Vuelva a intentar registarte' })
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.json({ token })
  }catch(error) {
    console.log('Error de validación de email:', error.message)
    return res.status(500).json({ error: 'Error al iniciar sesión' })
  }
}

export const CreaterDate = async (req, res) => {
  const { nombre, email, telefono, password } = req.body

  try {
    const ErrorEmail = await ValidarEmail(email)
    if(ErrorEmail) {
      console.log('Error de validación de email:', ErrorEmail.message)
      return res.status(ErrorEmail.status).json({ error: ErrorEmail.message })
    }

    const ErrorPassword = ValidarPassword(password)
    if(ErrorPassword) {
      console.log('Error de validación de contraseña:', ErrorPassword.message)
      return res.status(ErrorPassword.status).json({ error: ErrorPassword.message })
    }

    // Generar un código de verificación
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    const expiracion = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.verificacionPendiente.upsert({
      where: { email },
      update: { nombre, telefono, password, codigo, expiracion },
      create: { nombre, email, telefono, password, codigo, expiracion }
    })

    // Enviar el correo de verificación
    await enviarCorreo(email, codigo).catch(err => console.log('Error al enviar correo:', err))

    return res.json({ message: 'Usuario creado con éxito, por favor revisa tu correo para verificar tu cuenta.' })
  } catch(error) {
    console.log('ERROR COMPLETO:', error)
    return res.status(500).json({ error: 'Error al crear el usuario' })
  }
}

// GET /api/perfil — obtener perfil del usuario logueado
export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id:       true,
        nombre:   true,
        email:    true,
        telefono: true,
        rol:      true,
      }
    })
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(usuario)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
}

// PUT /api/perfil — actualizar perfil del usuario logueado
export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, telefono, password } = req.body

    // validar password si viene
    if (password) {
      const errorPassword = ValidarPassword(password)
      if (errorPassword) return res.status(errorPassword.status).json({ error: errorPassword.message })
    }

    const data = {}
    if (nombre)   data.nombre   = nombre
    if (telefono) data.telefono = telefono
    if (password) data.password = password

    const actualizado = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, nombre: true, email: true, telefono: true, rol: true }
    })

    res.json({ message: 'Perfil actualizado correctamente', usuario: actualizado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar perfil' })
  }
}