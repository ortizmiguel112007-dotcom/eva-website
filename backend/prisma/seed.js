import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@eva.com'
  const password = process.env.ADMIN_PASSWORD || 'default_password'

  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: {
      email,
    },

    update: {
      nombre: process.env.ADMIN_NAME || 'Administrador EVA',
      telefono: process.env.ADMIN_PHONE || '3000000000',
      password: passwordHash,
      rol: 'admin',
      verificado: true,
      activo: true,
    },

    create: {
      nombre: process.env.ADMIN_NAME || 'Administrador EVA',
      email,
      telefono: process.env.ADMIN_PHONE || '3000000000',
      password: passwordHash,
      verificado: true,
      activo: true,
      rol: 'admin',
    },
  })

  console.log(`Administrador creado/actualizado: ${admin.email}`)
}

main()
  .catch((error) => {
    console.error('Error creando administrador:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })