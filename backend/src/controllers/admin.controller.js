import prisma from '../conexion.js'

// GET /admin/usuarios - Obtener todos los usuarios (excepto admins)
export const GetUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      where: { rol: { not: 'admin' } },
      select: {
        id:         true,
        nombre:     true,
        email:      true,
        telefono:   true,
        rol:        true,
        verificado: true,
        activo:     true,
      },
      orderBy: { id: 'asc' }
    })
    return res.json(usuarios)
  } catch (error) {
    console.log('Error al obtener usuarios:', error)
    return res.status(500).json({ error: 'Error al obtener los usuarios' })
  }
}

// POST /admin/usuarios - Crear usuario directo (sin verificación por correo)
export const CreateUsuarioAdmin = async (req, res) => {
  const { nombre, email, telefono, password } = req.body

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' })
  }

  try {
    const existe = await prisma.user.findUnique({ where: { email } })
    if (existe) {
      return res.status(409).json({ error: 'El email ya está registrado' })
    }

    const usuario = await prisma.user.create({
      data: {
        nombre,
        email,
        telefono: telefono || '',
        password,
        verificado: true,
        activo:     true,
      }
    })

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    })
  } catch (error) {
    console.log('Error al crear usuario:', error)
    return res.status(500).json({ error: 'Error al crear el usuario' })
  }
}

// PUT /admin/usuarios/:id - Actualizar datos del usuario
export const UpdateUsuario = async (req, res) => {
  const { id } = req.params
  const { nombre, email, telefono, password } = req.body

  try {
    const existe = await prisma.user.findUnique({ where: { id: Number(id) } })
    if (!existe) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (email && email !== existe.email) {
      const emailEnUso = await prisma.user.findUnique({ where: { email } })
      if (emailEnUso) {
        return res.status(409).json({ error: 'El email ya está en uso por otro usuario' })
      }
    }

    const data = {}
    if (nombre)                 data.nombre   = nombre
    if (email)                  data.email    = email
    if (telefono !== undefined) data.telefono = telefono || ''
    if (password)               data.password = password

    const actualizado = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, nombre: true, email: true, telefono: true, rol: true, verificado: true, activo: true }
    })

    return res.json({ message: 'Usuario actualizado correctamente', usuario: actualizado })
  } catch (error) {
    console.log('Error al actualizar usuario:', error)
    return res.status(500).json({ error: 'Error al actualizar el usuario' })
  }
}

// PATCH /admin/usuarios/:id/estado - Habilitar o inhabilitar usuario
// RN-004.2: solo Activo <-> Inactivo
// RN-004.3: no se elimina información, solo cambia el campo activo
export const ToggleEstadoUsuario = async (req, res) => {
  const { id } = req.params

  try {
    const usuario = await prisma.user.findUnique({ where: { id: Number(id) } })
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const nuevoEstado = !usuario.activo

    const actualizado = await prisma.user.update({
      where: { id: Number(id) },
      data:  { activo: nuevoEstado },
      select: { id: true, nombre: true, activo: true }
    })

    return res.json({
      message: `Usuario ${nuevoEstado ? 'habilitado' : 'inhabilitado'} correctamente`,
      usuario: actualizado
    })
  } catch (error) {
    console.log('Error al cambiar estado del usuario:', error)
    return res.status(500).json({ error: 'Error al cambiar el estado del usuario' })
  }
}