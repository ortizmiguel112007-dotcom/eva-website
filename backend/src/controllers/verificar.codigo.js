import prisma from '../conexion.js'
import jwt from 'jsonwebtoken'

export const verificarCodigo = async (req, res) => {
  const { email, codigo } = req.body

  try{
    const pendiente = await prisma.verificacionPendiente.findUnique({
      where: { email }
    })

    console.log('Pendiente encontrado:', pendiente)

    if(!pendiente) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if(pendiente.codigo !== codigo) {
      return res.status(400).json({ error: 'Código incorrecto' })
    }

    if(new Date() > pendiente.expiracion) {
      await prisma.verificacionPendiente.delete({ where: { email } })
      return res.status(400).json({ error: 'Código expirado' })
    }

    const nuevo = await prisma.user.create({
      data: {
        nombre: pendiente.nombre,
        email: pendiente.email,
        telefono: pendiente.telefono,
        password: pendiente.password,
        verificado: true,
      }
    })
    
    const token = jwt.sign(
      { id: nuevo.id, email: nuevo.email, rol: nuevo.rol, nombre: nuevo.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    await prisma.verificacionPendiente.delete({ where: { email } })

    return res.json({ message: 'Cuenta verificada con éxito', token })

  } catch(error) {
    console.log('ERROR COMPLETO:', error.message)
    console.log('ERROR CODE:', error.code)
    return res.status(500).json({ error: error.message })
  }
}